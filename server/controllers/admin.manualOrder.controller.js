/**
 * Admin "Create Order" — for when a payment landed in Razorpay (or a customer
 * ordered by phone/WhatsApp) but no order exists in the store.
 *
 * The admin supplies customer details, items, address and how it was paid.
 * If the email already belongs to a customer the order is attached to that
 * account; otherwise a new account is created (random password — the customer
 * can set one via Forgot Password).
 */
import crypto from "crypto";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { processOrderForShipping } from "../utils/shiprocket.js";
import sendEmail from "../utils/sendEmail.js";
import { getOrderConfirmationTemplate } from "../email/temp/EmailTemplate.js";
import { markPreOrderFlag } from "../utils/preOrder.js";

const PAYMENT_METHODS = ["RAZORPAY", "CASH"];

const num = (v, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const generateReferralCode = (id) => {
  const shortId = id.slice(-6).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `REF${shortId}${rand}`;
};

// Find the customer by email, or create one. Returns { user, created }.
async function findOrCreateCustomer({ name, email, phone }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    // Only fill gaps — never overwrite what the customer already has on file
    const patch = {};
    if (!existing.phone && phone) patch.phone = phone;
    if (!existing.name && name) patch.name = name.trim();
    const user = Object.keys(patch).length
      ? await prisma.user.update({ where: { id: existing.id }, data: patch })
      : existing;
    return { user, created: false };
  }

  const hashedPassword = await bcrypt.hash(crypto.randomBytes(10).toString("hex"), 10);
  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || "",
        otpVerified: false,
      },
    });
    let referralCode = generateReferralCode(u.id);
    while (await tx.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode(u.id + Date.now());
    }
    return tx.user.update({ where: { id: u.id }, data: { referralCode } });
  });
  return { user, created: true };
}

export const createManualOrder = asyncHandler(async (req, res) => {
  const {
    customer = {},
    address = {},
    items = [],
    paymentMethod, // "RAZORPAY" | "CASH"
    razorpayPaymentId, // required for RAZORPAY
    razorpayOrderId,
    markAsPaid = false, // CASH only: has the money actually been collected?
    shippingCost = 0,
    discount = 0,
    codCharge = 0,
    notes,
    triggerShiprocket = true,
    sendCustomerEmail = true,
  } = req.body;
  const adminId = req.admin?.id;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!customer.name?.trim()) throw new ApiError(400, "Customer name is required");
  if (!customer.email || !String(customer.email).includes("@")) {
    throw new ApiError(400, "A valid customer email is required");
  }
  const phoneDigits = String(customer.phone || address.phone || "").replace(/\D/g, "");
  if (phoneDigits.length < 10) throw new ApiError(400, "A valid 10-digit phone number is required");

  for (const f of ["street", "city", "state", "postalCode"]) {
    if (!String(address[f] || "").trim()) throw new ApiError(400, `Address ${f} is required`);
  }
  if (!/^\d{6}$/.test(String(address.postalCode).trim())) {
    throw new ApiError(400, "Postal code must be 6 digits");
  }

  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, "Add at least one item");
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new ApiError(400, "Payment method must be RAZORPAY (online) or CASH (COD)");
  }

  let razorpayId = null;
  if (paymentMethod === "RAZORPAY") {
    razorpayId = String(razorpayPaymentId || "").trim();
    if (!/^pay_[A-Za-z0-9]+$/.test(razorpayId)) {
      throw new ApiError(400, "Enter the Razorpay Payment ID (looks like pay_XXXXXXXXXXXXXX)");
    }
    // The same payment can only ever back one order
    const dup = await prisma.razorpayPayment.findUnique({
      where: { razorpayPaymentId: razorpayId },
      include: { order: { select: { orderNumber: true } } },
    });
    if (dup) {
      throw new ApiError(400, `This Razorpay payment is already linked to order #${dup.order.orderNumber}`);
    }
  }

  // ── Resolve items against real variants (price comes from the DB unless the
  //    admin deliberately overrides it, e.g. for a phone-negotiated price) ────
  const variantIds = items.map((i) => i.variantId).filter(Boolean);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  const lines = [];
  let subTotal = 0;
  let hasPreOrderItem = false;
  for (const raw of items) {
    const variant = variantMap.get(raw.variantId);
    if (!variant) throw new ApiError(404, `Product variant not found: ${raw.variantId}`);
    const qty = parseInt(raw.quantity, 10);
    if (!qty || qty < 1) throw new ApiError(400, `Invalid quantity for ${variant.product.name}`);

    const overridden = raw.price !== undefined && raw.price !== null && raw.price !== "";
    const price = overridden ? num(raw.price) : num(variant.salePrice ?? variant.price);
    if (price < 0) throw new ApiError(400, `Invalid price for ${variant.product.name}`);

    const isPreOrder = markPreOrderFlag(variant, variant.product, qty);
    if (variant.quantity < qty && !variant.product.isPreOrderEnabled) {
      throw new ApiError(
        400,
        `Only ${variant.quantity} in stock for ${variant.product.name} — restock it first or reduce the quantity`
      );
    }
    if (isPreOrder) hasPreOrderItem = true;

    const itemSubtotal = Math.round(price * qty * 100) / 100;
    subTotal += itemSubtotal;
    lines.push({ variant, qty, price, itemSubtotal, isPreOrder });
  }

  const shipping = Math.max(num(shippingCost), 0);
  const cod = paymentMethod === "CASH" ? Math.max(num(codCharge), 0) : 0;
  const disc = Math.min(Math.max(num(discount), 0), subTotal);
  const total = Math.round((subTotal + shipping + cod - disc) * 100) / 100;

  // Reject invalid combinations BEFORE touching the database, so a refused
  // request never leaves behind a half-created customer account or address.
  if (hasPreOrderItem && paymentMethod === "CASH") {
    throw new ApiError(400, "Pre-order items can only be sold with online payment, not COD");
  }

  // ── Customer + address ────────────────────────────────────────────────────
  const { user, created: customerCreated } = await findOrCreateCustomer({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || address.phone,
  });

  // The address is created inside the order transaction below (not here), so
  // if the order fails — stock race, DB error — no orphan address is left behind.
  const addressData = {
    userId: user.id,
    name: (address.name || customer.name).trim(),
    phone: phoneDigits.slice(-10),
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: String(address.postalCode).trim(),
    country: address.country || "India",
    // Don't displace a default address an existing customer already has
    isDefault: customerCreated,
  };

  // ── Status: pre-order items are held; paid orders are PAID; unpaid COD is PENDING
  const isPaid = paymentMethod === "RAZORPAY" || markAsPaid;
  const status = hasPreOrderItem && paymentMethod === "RAZORPAY" ? "PRE_ORDERED" : isPaid ? "PAID" : "PENDING";

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const result = await prisma.$transaction(
    async (tx) => {
      const savedAddress = await tx.address.create({ data: addressData });

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status,
          subTotal: subTotal.toFixed(2),
          tax: "0.00",
          shippingCost: shipping.toFixed(2),
          discount: disc,
          codCharge: cod.toFixed(2),
          total: total.toFixed(2),
          paymentMethod,
          paymentGateway: paymentMethod === "RAZORPAY" ? "RAZORPAY" : undefined,
          shippingAddressId: savedAddress.id,
          billingAddressSameAsShipping: true,
          isPreOrder: hasPreOrderItem,
          notes: [notes, `Created manually by admin${adminId ? ` (${adminId})` : ""}`]
            .filter(Boolean)
            .join("\n"),
        },
      });

      let payment = null;
      if (paymentMethod === "RAZORPAY") {
        payment = await tx.razorpayPayment.create({
          data: {
            orderId: order.id,
            amount: total.toFixed(2),
            // razorpayOrderId is unique+required; fall back to a synthetic id so
            // the admin only has to supply the payment id they can see in Razorpay
            razorpayOrderId: String(razorpayOrderId || "").trim() || `MANUAL-${razorpayId}`,
            razorpayPaymentId: razorpayId,
            status: "CAPTURED",
            paymentMethod: "OTHER",
            notes: { createdManuallyByAdmin: true, adminId: adminId || null },
          },
        });
      }

      for (const l of lines) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: l.variant.productId,
            variantId: l.variant.id,
            price: l.price,
            originalPrice: l.variant.price,
            quantity: l.qty,
            subtotal: l.itemSubtotal,
            isPreOrder: l.isPreOrder,
          },
        });
        await tx.productVariant.update({
          where: { id: l.variant.id },
          data: { quantity: { decrement: l.qty } },
        });
        await tx.inventoryLog.create({
          data: {
            variantId: l.variant.id,
            quantityChange: -l.qty,
            reason: "sale",
            referenceId: order.id,
            previousQuantity: l.variant.quantity,
            newQuantity: l.variant.quantity - l.qty,
            createdBy: adminId || user.id,
            notes: `Manual order ${orderNumber}`,
          },
        });
      }

      return { order, payment, savedAddress };
    },
    { maxWait: 10000, timeout: 30000 }
  );

  await prisma.activityLog
    .create({
      data: {
        entityType: "order",
        entityId: result.order.id,
        action: "create",
        description: `Manual order ${orderNumber} created for ${user.email} (${paymentMethod}${razorpayId ? ` ${razorpayId}` : ""})`,
        performedBy: adminId,
        performedByRole: "admin",
      },
    })
    .catch(() => {});

  // ── Shiprocket (same rules as a normal order) ─────────────────────────────
  let shiprocketTriggered = false;
  if (triggerShiprocket && status !== "PRE_ORDERED" && status !== "PENDING") {
    const sr = await prisma.shiprocketSettings.findFirst();
    if (sr?.isEnabled && sr.bookingMode !== "MANUAL") {
      processOrderForShipping(result.order.id).catch((err) =>
        console.error("Shiprocket error for manual order:", err.message)
      );
      shiprocketTriggered = true;
    }
  }

  // ── Customer confirmation email (non-blocking) ────────────────────────────
  if (sendCustomerEmail && user.email) {
    (async () => {
      try {
        await sendEmail({
          email: user.email,
          subject: `Order Confirmation - #${orderNumber}`,
          html: getOrderConfirmationTemplate({
            userName: user.name || "Valued Customer",
            orderNumber,
            orderDate: result.order.createdAt,
            paymentMethod: paymentMethod === "CASH" ? "Cash on Delivery" : "Online Payment",
            items: lines.map((l) => ({
              name: l.variant.product.name,
              variant: "",
              quantity: l.qty,
              price: l.price.toFixed(2),
              sku: l.variant.sku || "",
            })),
            subtotal: subTotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: "0.00",
            discount: disc.toFixed(2),
            couponCode: "",
            total: total.toFixed(2),
            shippingAddress: result.savedAddress,
          }),
        });
      } catch (e) {
        console.error("Manual order confirmation email error:", e);
      }
    })();
  }

  res.status(201).json(
    new ApiResponsive(
      201,
      {
        order: {
          id: result.order.id,
          orderNumber,
          status,
          total,
        },
        customerCreated,
        customerEmail: user.email,
        shiprocketTriggered,
      },
      customerCreated
        ? "Order created and a new customer account was made for them"
        : "Order created on the customer's existing account"
    )
  );
});

// Look up a customer by email so the admin form can show "existing customer"
// (and prefill name/phone/addresses) before submitting.
export const lookupCustomerByEmail = asyncHandler(async (req, res) => {
  const email = String(req.query.email || "").toLowerCase().trim();
  if (!email.includes("@")) throw new ApiError(400, "A valid email is required");

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      addresses: {
        select: { id: true, name: true, street: true, city: true, state: true, postalCode: true, country: true, phone: true, isDefault: true },
        orderBy: { isDefault: "desc" },
        take: 5,
      },
    },
  });

  res.status(200).json(
    new ApiResponsive(200, { exists: !!user, customer: user || null }, user ? "Customer found" : "No customer with this email")
  );
});
