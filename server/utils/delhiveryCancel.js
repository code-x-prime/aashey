import { getDelhiverySettings, cancelShipment } from "./delhivery.js";

/**
 * Cancel the Delhivery waybill of an order that is being cancelled.
 * Never throws: order cancellation must go through even if the courier call fails.
 * `dbData` is what the caller should save on the order (success clears the waybill;
 * failure keeps it and flags the order so the admin can see it needs a manual cancel).
 */
export async function cancelDelhiveryForOrder(order) {
    if (!order || order.shippingProvider !== "DELHIVERY" || !order.awbCode) {
        return { attempted: false, cancelled: false, error: null, dbData: {} };
    }
    try {
        const settings = await getDelhiverySettings();
        if (!settings.isEnabled) throw new Error("Delhivery is disabled in settings");
        await cancelShipment(settings, order.awbCode);
        return {
            attempted: true,
            cancelled: true,
            error: null,
            dbData: { shiprocketStatus: "DELHIVERY_CANCELLED", awbCode: null, courierName: null, shippingProvider: null, shippingEmailSentAt: null },
        };
    } catch (e) {
        console.error(`[delhivery] cancel failed for waybill ${order.awbCode}:`, e.message);
        return { attempted: true, cancelled: false, error: e.message, dbData: { shiprocketStatus: "DELHIVERY_CANCEL_FAILED" } };
    }
}
