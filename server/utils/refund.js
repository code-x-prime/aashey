/**
 * Shared refund helper.
 *
 * Issues a Razorpay refund (full or partial) for an order and records it in the
 * RazorpayRefund table. Works with DB-based gateway keys (the same keys the
 * checkout flow uses), falling back to the ENV-based instance if present.
 *
 * For COD orders there is nothing to refund online — the function returns a
 * { skipped: "COD" } result so callers can still mark the order/return as
 * refunded manually.
 */

import Razorpay from "razorpay";
import { prisma } from "../config/db.js";
import { decrypt } from "./encryption.js";
import { razorpay as envRazorpay } from "../app.js";

// Build a Razorpay instance from the active DB gateway settings (or ENV).
async function getRazorpayInstance(ownerUserId = null) {
  if (envRazorpay) return envRazorpay;

  let settings = null;
  if (ownerUserId) {
    settings = await prisma.paymentGatewaySetting.findUnique({
      where: { userId_gateway: { userId: ownerUserId, gateway: "RAZORPAY" } },
    });
  }
  if (!settings) {
    settings = await prisma.paymentGatewaySetting.findFirst({
      where: { gateway: "RAZORPAY", isActive: true },
    });
  }

  if (!settings?.razorpayKeyId || !settings?.razorpayKeySecret) {
    throw new Error("Razorpay keys are not configured — cannot issue refund.");
  }

  const secret = decrypt(settings.razorpayKeySecret);
  if (!secret || !secret.trim()) {
    throw new Error("Failed to decrypt Razorpay key secret.");
  }

  return new Razorpay({ key_id: settings.razorpayKeyId, key_secret: secret });
}

/**
 * @param {object}  opts
 * @param {string}  opts.orderId       our Order id
 * @param {number}  opts.amount        amount to refund in rupees (defaults to full order total)
 * @param {string}  opts.reason        reason string stored on the refund
 * @param {string}  [opts.referenceId] optional id (e.g. returnRequest id) stored in notes
 * @returns {Promise<{ refundId?: string, amount: number, status: string, skipped?: string }>}
 */
export async function issueRefund({ orderId, amount, reason = "Refund", referenceId = null }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { razorpayPayment: true },
  });

  if (!order) throw new Error("Order not found for refund");

  const payment = order.razorpayPayment;
  const isOnline =
    order.paymentMethod === "RAZORPAY" &&
    payment?.razorpayPaymentId &&
    !String(payment.razorpayPaymentId).startsWith("MANUAL");

  // Nothing to refund online (COD / manual / unpaid)
  if (!isOnline) {
    return { skipped: order.paymentMethod === "CASH" ? "COD" : "NO_ONLINE_PAYMENT", amount: 0, status: "SKIPPED" };
  }

  // Clamp the refund to what is still refundable on this payment
  const alreadyRefunded = await prisma.razorpayRefund
    .aggregate({
      _sum: { amount: true },
      where: { razorpayPaymentId: payment.razorpayPaymentId },
    })
    .then((r) => parseFloat(r._sum.amount || 0));

  const paid = parseFloat(payment.amount);
  const requested = amount != null ? parseFloat(amount) : parseFloat(order.total);
  const refundable = Math.max(paid - alreadyRefunded, 0);
  const finalAmount = Math.min(requested, refundable);

  if (finalAmount <= 0) {
    return { skipped: "NOTHING_REFUNDABLE", amount: 0, status: "SKIPPED" };
  }

  const instance = await getRazorpayInstance(order.paymentOwnerId);

  const refund = await instance.payments.refund(payment.razorpayPaymentId, {
    amount: Math.round(finalAmount * 100), // paise
    notes: { reason, ...(referenceId ? { referenceId } : {}) },
  });

  if (!refund?.id) {
    throw new Error("Razorpay did not return a refund id");
  }

  await prisma.razorpayRefund.create({
    data: {
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: finalAmount.toFixed(2),
      razorpayRefundId: refund.id,
      status: "PROCESSED",
      reason,
      notes: { refundId: refund.id, ...(referenceId ? { referenceId } : {}) },
    },
  });

  // Mark the payment REFUNDED only when the full paid amount has now been returned
  const totalRefundedNow = alreadyRefunded + finalAmount;
  if (totalRefundedNow >= paid - 0.01) {
    await prisma.razorpayPayment.update({
      where: { orderId },
      data: { status: "REFUNDED" },
    });
  }

  return { refundId: refund.id, amount: finalAmount, status: "PROCESSED" };
}
