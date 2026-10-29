import { prisma } from "../config/db.js";
import sendEmail from "./sendEmail.js";
import { getShippingNotificationTemplate } from "../email/temp/EmailTemplate.js";

export const trackingUrlFor = (order) =>
    order.shippingProvider === "DELHIVERY"
        ? `https://www.delhivery.com/track/package/${order.awbCode}`
        : `https://shiprocket.co/tracking/${order.awbCode}`;

/**
 * Email the customer their tracking details — once per booking, for both couriers
 * and for both auto and manual booking. Never throws (booking must not fail on mail).
 * Re-booking after a cancelled shipment resets `shippingEmailSentAt`, so the new
 * waybill is emailed too.
 */
export async function sendShippingEmailForOrder(orderId) {
    let claimed = false;
    try {
        const claim = await prisma.order.updateMany({
            where: { id: orderId, shippingEmailSentAt: null, awbCode: { not: null } },
            data: { shippingEmailSentAt: new Date() },
        });
        if (claim.count === 0) return false;
        claimed = true;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { name: true, email: true } },
                shippingAddress: true,
                items: {
                    include: {
                        product: { select: { name: true } },
                        variant: { include: { attributes: { include: { attributeValue: { include: { attribute: true } } } } } },
                    },
                },
            },
        });
        if (!order?.user?.email) throw new Error("order has no customer email");

        const html = getShippingNotificationTemplate({
            userName: order.user.name,
            orderNumber: order.orderNumber,
            awbCode: order.awbCode,
            courierName: order.courierName,
            trackingUrl: trackingUrlFor(order),
            shippingAddress: order.shippingAddress,
            orderDate: new Date().toLocaleDateString("en-IN"),
            estimatedDelivery: order.selectedCourierEtd || undefined,
            items: order.items.map((item) => ({
                name: item.product?.name || "Product",
                variant: item.variant?.attributes?.map((a) => `${a.attributeValue.attribute.name}: ${a.attributeValue.value}`).join(", ") || "",
                quantity: item.quantity,
                price: parseFloat(item.price).toFixed(2),
            })),
            total: order.total,
        });
        await sendEmail({
            email: order.user.email,
            subject: `Your Order #${order.orderNumber} Has Been Shipped! - Tracking: ${order.awbCode}`,
            html,
        });
        return true;
    } catch (e) {
        console.error(`[shipping-email] failed for order ${orderId}:`, e.message);
        if (claimed) await prisma.order.update({ where: { id: orderId }, data: { shippingEmailSentAt: null } }).catch(() => {});
        return false;
    }
}
