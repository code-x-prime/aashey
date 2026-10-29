import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { encrypt } from "../utils/encryption.js";
import { withOrderLock } from "../utils/orderLock.js";
import { cancelShiprocketOrder } from "../utils/shiprocket.js";
import {
    getDelhiverySettings,
    checkPincode,
    getDeliveryOptions,
    buildShipment,
    createShipment,
    getPackingSlip,
    trackShipment,
    cancelShipment as delhiveryCancel,
    requestPickup,
} from "../utils/delhivery.js";

const ORDER_INCLUDE = {
    shippingAddress: true,
    user: true,
    items: { include: { variant: true, product: true } },
};

const maskSettings = (s) => ({ ...s, token: s.token ? "********" : null });

async function loadOrder(orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
    if (!order) throw new ApiError(404, "Order not found");
    return order;
}

async function requireEnabled() {
    const settings = await getDelhiverySettings();
    if (!settings.isEnabled) throw new ApiError(400, "Delhivery is not enabled. Turn it on in Delhivery settings first.");
    return settings;
}

const orderWeightKg = (order, defaultWeight) =>
    Math.max(
        0.5,
        order.items.reduce((sum, i) => sum + (i.variant?.shippingWeight || defaultWeight) * i.quantity, 0)
    );

async function getOriginPincode() {
    const pickup = await prisma.shiprocketPickupAddress.findFirst({ orderBy: { isDefault: "desc" } });
    if (!pickup?.pincode) throw new ApiError(400, "No pickup address found. Add your warehouse pincode in Shiprocket pickup addresses.");
    return String(pickup.pincode);
}

export const getSettings = asyncHandler(async (req, res) => {
    const settings = await getDelhiverySettings();
    res.status(200).json(new ApiResponsive(200, { settings: maskSettings(settings) }, "Settings fetched successfully"));
});

export const updateSettings = asyncHandler(async (req, res) => {
    const { isEnabled, token, mode, pickupLocation, sellerName, hsnCode, defaultWeight } = req.body;
    const settings = await getDelhiverySettings();
    const data = {};

    if (typeof isEnabled === "boolean") data.isEnabled = isEnabled;
    if (mode !== undefined) {
        if (!["STAGING", "PRODUCTION"].includes(mode)) throw new ApiError(400, "mode must be STAGING or PRODUCTION");
        data.mode = mode;
    }
    if (typeof token === "string" && token.trim() && token !== "********") data.token = "enc:" + encrypt(token.trim());
    if (pickupLocation !== undefined) data.pickupLocation = String(pickupLocation).trim() || null;
    if (sellerName !== undefined) data.sellerName = String(sellerName).trim() || null;
    if (hsnCode !== undefined) data.hsnCode = String(hsnCode).trim() || null;
    if (defaultWeight !== undefined) {
        const w = parseFloat(defaultWeight);
        if (!Number.isFinite(w) || w <= 0) throw new ApiError(400, "defaultWeight must be a positive number");
        data.defaultWeight = w;
    }

    const next = { ...settings, ...data };
    if (next.isEnabled && (!next.token || !next.pickupLocation)) {
        throw new ApiError(400, "Add the API token and the exact pickup location name before enabling Delhivery.");
    }

    const updated = await prisma.delhiverySettings.update({ where: { id: settings.id }, data });
    res.status(200).json(new ApiResponsive(200, { settings: maskSettings(updated) }, "Settings updated successfully"));
});

export const testConnection = asyncHandler(async (req, res) => {
    const settings = await getDelhiverySettings();
    try {
        await checkPincode(settings, "110001");
        res.status(200).json(new ApiResponsive(200, { connected: true, mode: settings.mode }, "Connection successful"));
    } catch (e) {
        throw new ApiError(400, `Connection failed: ${e.message}`);
    }
});

export const getOrderOptions = asyncHandler(async (req, res) => {
    const settings = await requireEnabled();
    const order = await loadOrder(req.params.orderId);
    const destPin = String(order.shippingAddress?.postalCode || "");
    if (!destPin) throw new ApiError(400, "Order has no delivery pincode");

    const originPin = await getOriginPincode();
    const weightKg = orderWeightKg(order, settings.defaultWeight);
    const result = await getDeliveryOptions(settings, { weightKg, originPin, destPin });

    if (!result.serviceable) {
        throw new ApiError(400, `Delhivery does not deliver to ${destPin}. Use another courier for this order.`);
    }
    if (order.paymentMethod === "CASH" && !result.cod) {
        throw new ApiError(400, `Delhivery does not offer Cash on Delivery at ${destPin}.`);
    }
    const couriers = [result.options.slow, result.options.fast].filter(Boolean);
    res.status(200).json(
        new ApiResponsive(200, { couriers, options: result.options, deliveryPincode: destPin, pickupPincode: originPin, totalWeight: weightKg }, "Delhivery options fetched")
    );
});

// One booking per order at a time: a double-click or retry can't create two waybills
export const bookShipment = asyncHandler((req, res) => withOrderLock(req.params.orderId, () => bookShipmentUnlocked(req, res)));

async function bookShipmentUnlocked(req, res) {
    const { speed } = req.body;
    if (!["SLOW", "FAST"].includes(speed)) throw new ApiError(400, "speed must be SLOW or FAST");

    const settings = await requireEnabled();
    const order = await loadOrder(req.params.orderId);
    if (order.status === "CANCELLED") throw new ApiError(400, "Cannot book shipment for a cancelled order.");
    if (order.awbCode) throw new ApiError(400, `Shipment already booked. Waybill: ${order.awbCode}. Cancel it first to re-book.`);
    if (order.status === "PRE_ORDERED") throw new ApiError(400, "This is a pre-order that has not reached its launch date yet.");

    const originPin = await getOriginPincode();
    const weightKg = orderWeightKg(order, settings.defaultWeight);
    const destPin = String(order.shippingAddress?.postalCode || "");

    // Re-quote so the saved rate is what Delhivery would charge right now
    const result = await getDeliveryOptions(settings, { weightKg, originPin, destPin });
    if (!result.serviceable) throw new ApiError(409, `Delhivery does not deliver to ${destPin}.`);
    if (order.paymentMethod === "CASH" && !result.cod) throw new ApiError(409, `Delhivery does not offer COD at ${destPin}.`);
    const chosen = speed === "FAST" ? result.options.fast : result.options.slow;
    if (!chosen) throw new ApiError(409, `Delhivery ${speed === "FAST" ? "Express" : "Surface"} is not available from ${originPin} to ${destPin}.`);

    // A Shiprocket order created earlier but never given an AWB would stay stuck there; clear it
    const clearShiprocket = {};
    if (order.shiprocketOrderId && !order.awbCode) {
        try {
            await cancelShiprocketOrder(order.shiprocketOrderId);
        } catch (e) {
            console.error("[delhivery] could not cancel stuck Shiprocket order:", e.message);
        }
        Object.assign(clearShiprocket, { shiprocketOrderId: null, shiprocketShipmentId: null });
    }

    let created;
    try {
        created = await createShipment(settings, buildShipment(order, { settings, weightKg, mode: speed }));
    } catch (e) {
        throw new ApiError(400, e.message);
    }

    const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
            ...clearShiprocket,
            shippingProvider: "DELHIVERY",
            awbCode: created.waybill,
            courierName: chosen.name,
            selectedCourierName: chosen.name,
            selectedCourierRate: chosen.rate,
            selectedDeliverySpeed: speed,
            shiprocketStatus: "DELHIVERY_BOOKED",
            status: "SHIPPED", // same as the Shiprocket flow
        },
        select: { id: true, awbCode: true, courierName: true, selectedCourierRate: true, selectedDeliverySpeed: true, status: true },
    });

    // Pickup is best-effort: the shipment exists even if the pickup request fails
    let pickup = null;
    let pickupError = null;
    try {
        const d = new Date();
        d.setDate(d.getDate() + (d.getHours() >= 15 ? 1 : 0));
        pickup = await requestPickup(settings, { date: d.toISOString().slice(0, 10), count: 1 });
    } catch (e) {
        pickupError = e.message;
    }

    res.status(200).json(
        new ApiResponsive(200, { order: updated, waybill: created.waybill, pickup, pickupError }, pickupError ? "Shipment booked, but pickup request failed — request pickup again." : "Shipment booked successfully")
    );
}

export const getLabel = asyncHandler(async (req, res) => {
    const settings = await requireEnabled();
    const order = await loadOrder(req.params.orderId);
    if (!order.awbCode) throw new ApiError(400, "Book the shipment first");
    try {
        const slip = await getPackingSlip(settings, order.awbCode);
        res.status(200).json(new ApiResponsive(200, { waybill: order.awbCode, slip }, "Label fetched"));
    } catch (e) {
        throw new ApiError(400, e.message);
    }
});

export const getTracking = asyncHandler(async (req, res) => {
    const settings = await requireEnabled();
    const order = await loadOrder(req.params.orderId);
    if (!order.awbCode) throw new ApiError(400, "Book the shipment first");
    try {
        res.status(200).json(new ApiResponsive(200, await trackShipment(settings, order.awbCode), "Tracking fetched"));
    } catch (e) {
        throw new ApiError(400, e.message);
    }
});

export const cancelShipment = asyncHandler(async (req, res) => {
    const settings = await requireEnabled();
    const order = await loadOrder(req.params.orderId);
    if (!order.awbCode) throw new ApiError(400, "No shipment to cancel");
    try {
        await delhiveryCancel(settings, order.awbCode);
    } catch (e) {
        throw new ApiError(400, e.message);
    }
    await prisma.order.update({
        where: { id: order.id },
        data: { awbCode: null, courierName: null, shiprocketStatus: "DELHIVERY_CANCELLED", shippingProvider: null, selectedDeliverySpeed: null, selectedCourierRate: null, selectedCourierName: null },
    });
    res.status(200).json(new ApiResponsive(200, {}, "Shipment cancelled"));
});
