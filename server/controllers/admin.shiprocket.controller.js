/**
 * Shiprocket Admin Controller
 * Handles admin operations for Shiprocket integration
 */

import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import sendEmail from "../utils/sendEmail.js";
import { getShippingNotificationTemplate } from "../email/temp/EmailTemplate.js";
import {
    authenticate,
    getShiprocketSettings,
    checkServiceability,
    processOrderForShipping,
    assignAWB,
    schedulePickup,
    trackShipment,
    trackByOrderId,
    cancelShiprocketOrder,
    generateLabel,
    printInvoice,
    getPickupLocations,
    addPickupLocation,
    getShiprocketOrderDetails,
} from "../utils/shiprocket.js";

// Get Shiprocket settings
export const getSettings = asyncHandler(async (req, res) => {
    const settings = await getShiprocketSettings();

    // Mask password for security
    const maskedSettings = {
        ...settings,
        password: settings.password ? "********" : null,
        token: settings.token ? "********" : null,
    };

    res.status(200).json(
        new ApiResponsive(200, { settings: maskedSettings }, "Settings fetched successfully")
    );
});

// Update Shiprocket settings
export const updateSettings = asyncHandler(async (req, res) => {
    const {
        isEnabled,
        email,
        password,
        defaultLength,
        defaultBreadth,
        defaultHeight,
        defaultWeight,
        shippingCharge,
        freeShippingThreshold,
    } = req.body;

    const settings = await getShiprocketSettings();

    const updateData = {};

    if (typeof isEnabled === "boolean") {
        updateData.isEnabled = isEnabled;
    }

    if (email !== undefined) {
        updateData.email = email.trim();
    }

    if (password && password !== "********") {
        // Encrypt password before storing
        updateData.password = "enc:" + encrypt(password.trim());
        // Clear token to force re-authentication
        updateData.token = null;
        updateData.tokenExpiry = null;
    }

    if (defaultLength !== undefined) {
        updateData.defaultLength = parseFloat(defaultLength);
    }
    if (defaultBreadth !== undefined) {
        updateData.defaultBreadth = parseFloat(defaultBreadth);
    }
    if (defaultHeight !== undefined) {
        updateData.defaultHeight = parseFloat(defaultHeight);
    }
    if (defaultWeight !== undefined) {
        updateData.defaultWeight = parseFloat(defaultWeight);
    }

    if (shippingCharge !== undefined) {
        updateData.shippingCharge = parseFloat(shippingCharge);
    }

    if (freeShippingThreshold !== undefined) {
        updateData.freeShippingThreshold = parseFloat(freeShippingThreshold);
    }

    updateData.updatedBy = req.admin?.id;

    const updatedSettings = await prisma.shiprocketSettings.update({
        where: { id: settings.id },
        data: updateData,
    });

    // Mask sensitive data
    const maskedSettings = {
        ...updatedSettings,
        password: updatedSettings.password ? "********" : null,
        token: updatedSettings.token ? "********" : null,
    };

    res.status(200).json(
        new ApiResponsive(200, { settings: maskedSettings }, "Settings updated successfully")
    );
});

// Test Shiprocket connection
export const testConnection = asyncHandler(async (req, res) => {
    try {
        const token = await authenticate();

        if (token) {
            res.status(200).json(
                new ApiResponsive(200, { connected: true }, "Connection successful")
            );
        } else {
            throw new Error("Failed to get authentication token");
        }
    } catch (error) {
        throw new ApiError(400, `Connection failed: ${error.message}`);
    }
});

// Get all pickup addresses
export const getPickupAddresses = asyncHandler(async (req, res) => {
    const addresses = await prisma.shiprocketPickupAddress.findMany({
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json(
        new ApiResponsive(200, { addresses }, "Pickup addresses fetched successfully")
    );
});

// Create pickup address
export const createPickupAddress = asyncHandler(async (req, res) => {
    const {
        nickname,
        name,
        email,
        phone,
        address,
        address2,
        city,
        state,
        country,
        pincode,
        isDefault,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // If setting as default, unset other defaults
    if (isDefault) {
        await prisma.shiprocketPickupAddress.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
        });
    }

    const pickupAddress = await prisma.shiprocketPickupAddress.create({
        data: {
            nickname: nickname || "Warehouse",
            name,
            email,
            phone,
            address,
            address2: address2 || null,
            city,
            state,
            country: country || "India",
            pincode,
            isDefault: isDefault ?? true,
        },
    });

    res.status(201).json(
        new ApiResponsive(201, { address: pickupAddress }, "Pickup address created successfully")
    );
});

// Update pickup address
export const updatePickupAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await prisma.shiprocketPickupAddress.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new ApiError(404, "Pickup address not found");
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
        await prisma.shiprocketPickupAddress.updateMany({
            where: { isDefault: true, id: { not: id } },
            data: { isDefault: false },
        });
    }

    const updated = await prisma.shiprocketPickupAddress.update({
        where: { id },
        data: updateData,
    });

    res.status(200).json(
        new ApiResponsive(200, { address: updated }, "Pickup address updated successfully")
    );
});

// Delete pickup address
export const deletePickupAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.shiprocketPickupAddress.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new ApiError(404, "Pickup address not found");
    }

    await prisma.shiprocketPickupAddress.delete({
        where: { id },
    });

    res.status(200).json(
        new ApiResponsive(200, null, "Pickup address deleted successfully")
    );
});

// Check serviceability for an order
export const checkOrderServiceability = asyncHandler(async (req, res) => {
    const { pickupPincode, deliveryPincode, weight, cod } = req.body;

    if (!pickupPincode || !deliveryPincode || !weight) {
        throw new ApiError(400, "Pickup pincode, delivery pincode, and weight are required");
    }

    const result = await checkServiceability({
        pickupPincode,
        deliveryPincode,
        weight: parseFloat(weight),
        cod: cod || false,
    });

    res.status(200).json(
        new ApiResponsive(200, { serviceability: result }, "Serviceability checked successfully")
    );
});

// Sync order to Shiprocket
export const syncOrderToShiprocket = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.shiprocketOrderId) {
        throw new ApiError(400, "Order already synced to Shiprocket");
    }

    const result = await processOrderForShipping(orderId);

    if (!result) {
        throw new ApiError(400, "Shiprocket is disabled or configuration is missing");
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketOrderId: true,
            shiprocketShipmentId: true,
            awbCode: true,
            courierName: true,
            shiprocketStatus: true,
        },
    });

    res.status(200).json(
        new ApiResponsive(200, { order: updatedOrder, shiprocketResponse: result }, "Order synced to Shiprocket successfully")
    );
});

// Get tracking info for an order
export const getOrderTracking = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            awbCode: true,
            shiprocketOrderId: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let trackingData = null;

    if (order.awbCode) {
        trackingData = await trackShipment(order.awbCode);
    } else if (order.shiprocketOrderId) {
        trackingData = await trackByOrderId(order.shiprocketOrderId);
    } else {
        throw new ApiError(400, "Order not yet synced to Shiprocket");
    }

    res.status(200).json(
        new ApiResponsive(200, { tracking: trackingData }, "Tracking info fetched successfully")
    );
});

// Cancel Shiprocket shipment
export const cancelShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            orderNumber: true,
            shiprocketOrderId: true,
            shiprocketStatus: true,
            awbCode: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.shiprocketOrderId) {
        throw new ApiError(400, "Order not synced to Shiprocket yet. Nothing to cancel.");
    }

    if (order.shiprocketStatus === "CANCELLED") {
        throw new ApiError(400, "Shipment is already cancelled in Shiprocket.");
    }

    try {
        const result = await cancelShiprocketOrder(order.shiprocketOrderId);

        await prisma.order.update({
            where: { id: orderId },
            data: {
                shiprocketStatus: "CANCELLED",
                awbCode: null,
                courierName: null,
            },
        });

        console.log(`Shiprocket shipment cancelled for order ${order.orderNumber}: ${JSON.stringify(result)}`);

        res.status(200).json(
            new ApiResponsive(200, {
                shiprocketStatus: "CANCELLED",
                shiprocketOrderId: order.shiprocketOrderId,
                result,
            }, `Shipment cancelled successfully for order ${order.orderNumber}`)
        );
    } catch (error) {
        console.error(`Shiprocket cancel failed for order ${order.orderNumber}:`, error.message);
        throw new ApiError(400, `Shiprocket cancel failed: ${error.message}. Please cancel manually on Shiprocket dashboard.`);
    }
});

// Get shipping label for order
export const getShippingLabel = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketShipmentId: true,
            orderNumber: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.shiprocketShipmentId) {
        throw new ApiError(400, "Order not synced to Shiprocket yet. Label not available.");
    }

    try {
        const result = await generateLabel(order.shiprocketShipmentId);

        // Shiprocket returns { response: { data: { label_url: "..." } } }
        const labelUrl = result?.response?.data?.label_url || result?.label_url || null;

        console.log(`Label generated for order ${order.orderNumber}: ${labelUrl || "no URL"}`);

        res.status(200).json(
            new ApiResponsive(200, {
                label_url: labelUrl,
                shiprocketShipmentId: order.shiprocketShipmentId,
                raw: result,
            }, "Shipping label generated successfully")
        );
    } catch (error) {
        console.error(`Label generation failed for order ${order.orderNumber}:`, error.message);
        throw new ApiError(400, `Label generation failed: ${error.message}`);
    }
});

// Get invoice for order
export const getOrderInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketOrderId: true,
            orderNumber: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.shiprocketOrderId) {
        throw new ApiError(400, "Order not synced to Shiprocket yet. Invoice not available.");
    }

    try {
        const result = await printInvoice(order.shiprocketOrderId);

        // Shiprocket returns { response: { data: { invoice_url: "..." } } }
        const invoiceUrl = result?.response?.data?.invoice_url || result?.invoice_url || null;

        console.log(`Invoice generated for order ${order.orderNumber}: ${invoiceUrl || "no URL"}`);

        res.status(200).json(
            new ApiResponsive(200, {
                invoice_url: invoiceUrl,
                shiprocketOrderId: order.shiprocketOrderId,
                raw: result,
            }, "Invoice generated successfully")
        );
    } catch (error) {
        console.error(`Invoice generation failed for order ${order.orderNumber}:`, error.message);
        throw new ApiError(400, `Invoice generation failed: ${error.message}`);
    }
});

// Webhook handler for Shiprocket tracking updates
export const handleWebhook = asyncHandler(async (req, res) => {
    const {
        awb,
        current_status,
        current_status_id,
        order_id,
        sr_order_id,
        courier_name,
        etd,
        scans,
    } = req.body;

    console.log("Shiprocket webhook received:", {
        awb,
        current_status,
        order_id,
    });

    // Find order by AWB code or Shiprocket order ID
    let order = null;

    if (awb) {
        order = await prisma.order.findFirst({
            where: { awbCode: awb },
        });
    }

    if (!order && sr_order_id) {
        order = await prisma.order.findFirst({
            where: { shiprocketOrderId: sr_order_id },
        });
    }

    if (!order && order_id) {
        // order_id from webhook is in format "orderNumber_shiprocketId"
        const orderNumber = order_id.split("_")[0];
        order = await prisma.order.findUnique({
            where: { orderNumber },
        });
    }

    if (!order) {
        console.log("Order not found for webhook:", { awb, order_id, sr_order_id });
        // Return success anyway to prevent retries
        return res.status(200).json({ status: "ok" });
    }

    // Update order with tracking status
    const updateData = {
        shiprocketStatus: current_status,
    };

    if (courier_name) {
        updateData.courierName = courier_name;
    }

    // Map Shiprocket status to our order status
    const statusMapping = {
        PICKED_UP: "SHIPPED",
        SHIPPED: "SHIPPED",
        IN_TRANSIT: "SHIPPED",
        OUT_FOR_DELIVERY: "SHIPPED",
        DELIVERED: "DELIVERED",
        CANCELLED: "CANCELLED",
        RTO_INITIATED: "CANCELLED",
        RTO_DELIVERED: "CANCELLED",
    };

    if (statusMapping[current_status]) {
        updateData.status = statusMapping[current_status];
    }

    await prisma.order.update({
        where: { id: order.id },
        data: updateData,
    });

    // Also update tracking table if exists
    if (order.tracking) {
        const latestScan = scans && scans.length > 0 ? scans[scans.length - 1] : null;

        await prisma.tracking.update({
            where: { orderId: order.id },
            data: {
                status: current_status === "DELIVERED" ? "DELIVERED" : "IN_TRANSIT",
                ...(current_status === "DELIVERED" && { deliveredAt: new Date() }),
            },
        });

        // Add tracking update if we have scan data
        if (latestScan) {
            await prisma.trackingUpdate.create({
                data: {
                    trackingId: order.tracking.id,
                    status: current_status,
                    location: latestScan.location || "",
                    description: latestScan.activity || current_status,
                },
            });
        }
    }

    res.status(200).json({ status: "ok" });
});

// Get available couriers for a specific order
export const getOrderCouriers = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            shippingAddress: true,
            items: {
                include: { variant: true },
            },
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const deliveryPincode = order.shippingAddress?.postalCode;
    if (!deliveryPincode) {
        throw new ApiError(400, "Order has no delivery pincode");
    }

    const settings = await getShiprocketSettings();
    const pickupAddress = await prisma.shiprocketPickupAddress.findFirst({
        where: { isDefault: true },
    });

    const pickupPincode = pickupAddress?.pincode;
    if (!pickupPincode) {
        throw new ApiError(400, "No default pickup address configured in Shiprocket settings");
    }

    const totalWeight = Math.max(
        order.items.reduce((sum, item) => {
            const weight = item.variant?.shippingWeight || 0.5;
            return sum + weight * item.quantity;
        }, 0),
        0.5
    );

    const result = await checkServiceability({
        pickupPincode,
        deliveryPincode,
        weight: totalWeight,
        cod: false,
    });

    const couriers = (result?.data?.available_courier_companies || []).map((c) => ({
        id: c.courier_company_id,
        name: c.courier_name,
        rate: parseFloat(c.rate),
        etd: c.etd || "2-3 days",
        codAvailable: c.cod === 1,
    }));

    couriers.sort((a, b) => a.rate - b.rate);

    res.status(200).json(
        new ApiResponsive(200, { couriers, deliveryPincode, totalWeight }, "Couriers fetched successfully")
    );
});

// Book shipment with selected courier
export const bookShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { courierId } = req.body;

    if (!courierId) {
        throw new ApiError(400, "courierId is required");
    }

    // 1. Fetch order
    let order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // 2. Save courier preference first
    order = await prisma.order.update({
        where: { id: orderId },
        data: {
            selectedCourierId: parseInt(courierId, 10),
            selectedCourierName: null,
        },
    });

    // 3. Auto-sync from Shiprocket first if order is synced but lacks AWB locally
    if (order.shiprocketOrderId && !order.awbCode) {
        try {
            const { syncOrderFromShiprocket } = await import("../utils/shiprocket.js");
            const synced = await syncOrderFromShiprocket(orderId);
            if (synced) {
                order = synced;
            }
        } catch (syncErr) {
            console.error("Auto-sync inside bookShipment failed:", syncErr.message);
        }
    }

    // 4. Case 1: Already fully booked
    if (order.awbCode) {
        throw new ApiError(400, `Shipment already booked. AWB: ${order.awbCode}. Cancel first to rebook.`);
    }

    // 5. Case 2: Reset if cancelled in Shiprocket
    if (order.shiprocketStatus === "CANCELLED") {
        console.log(`[BOOK] Order was cancelled, resetting for rebooking`);
        order = await prisma.order.update({
            where: { id: orderId },
            data: {
                shiprocketOrderId: null,
                shiprocketShipmentId: null,
                shiprocketStatus: null,
                awbCode: null,
                courierName: null,
            },
        });
    }

    // 6. Ensure order is synced to Shiprocket (Case 4 & 5)
    if (!order.shiprocketOrderId || !order.shiprocketShipmentId) {
        console.log(`[BOOK] Syncing order ${order.orderNumber} to Shiprocket...`);
        const syncResult = await processOrderForShipping(orderId);
        if (!syncResult) {
            throw new ApiError(400, "Shiprocket is disabled or configuration is missing. Check Shiprocket settings.");
        }

        // Use shipment_id from sync result directly (most reliable source)
        const freshShipmentId = syncResult.shipment_id
            ? parseInt(syncResult.shipment_id, 10)
            : null;

        // Refetch order after sync to get all updated fields
        order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        // If DB still doesn't have shiprocketShipmentId but sync result has it, use sync result
        if (!order.shiprocketShipmentId && freshShipmentId) {
            console.log(`[BOOK] DB missing shiprocketShipmentId, patching from sync result: ${freshShipmentId}`);
            order = await prisma.order.update({
                where: { id: orderId },
                data: { shiprocketShipmentId: freshShipmentId },
            });
        }
    }

    // 7. Final guard: shiprocketShipmentId must be present before AWB assignment
    if (!order.shiprocketShipmentId) {
        throw new ApiError(400,
            `Cannot assign AWB: Shiprocket Shipment ID is missing for order ${order.orderNumber}. ` +
            `Shiprocket Order ID: ${order.shiprocketOrderId || "none"}. ` +
            `Please use the Re-sync button on the order page or check Shiprocket dashboard.`
        );
    }

    // 8. Assign AWB (this will throw if it fails, which is correct because the admin is waiting for confirmation)
    console.log(`[BOOK] Assigning AWB to shipment ${order.shiprocketShipmentId} with courier ${courierId}`);
    const awbResponse = await assignAWB(order.shiprocketShipmentId, parseInt(courierId, 10));
    console.log(`[BOOK] AWB full response:`, JSON.stringify(awbResponse));

    // Shiprocket AWB response shapes:
    // 1. { response: { data: { awb_code, courier_name } } }
    // 2. { awb_code, courier_name } (direct)
    // 3. { awb_assign_status: [{ awb_code, courier_name }] } (array format)
    const responseData = awbResponse?.response?.data || awbResponse;
    const assignedItem = responseData?.awb_assign_status?.[0] || responseData;

    const awbCode =
        assignedItem?.awb_code ||
        assignedItem?.awb ||
        awbResponse?.awb_code ||
        null;

    const courierName =
        assignedItem?.courier_name ||
        assignedItem?.courier ||
        awbResponse?.courier_name ||
        null;

    if (!awbCode) {
        const errMsg =
            responseData?.message ||
            awbResponse?.response?.message ||
            awbResponse?.message ||
            "AWB assignment failed — no AWB code in response";
        throw new ApiError(400, `${errMsg}. Full response: ${JSON.stringify(awbResponse)}`);
    }

    // Update database with AWB details
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            awbCode,
            courierName,
            shiprocketStatus: "AWB_ASSIGNED",
            selectedCourierName: courierName,
        },
    });

    // Schedule pickup
    try {
        await schedulePickup(updatedOrder.shiprocketShipmentId);
        await prisma.order.update({
            where: { id: orderId },
            data: { shiprocketStatus: "PICKUP_SCHEDULED" },
        });
        console.log(`[BOOK] Pickup scheduled for order ${updatedOrder.orderNumber}`);
    } catch (e) {
        console.error(`[BOOK] Pickup scheduling failed (non-critical):`, e.message);
    }

    // Fetch final updated order details
    const finalOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketOrderId: true,
            shiprocketShipmentId: true,
            awbCode: true,
            courierName: true,
            shiprocketStatus: true,
            selectedCourierId: true,
            selectedCourierName: true,
            orderNumber: true,
            user: { select: { name: true, email: true } },
            shippingAddress: { select: { name: true, street: true, city: true, state: true, postalCode: true, country: true, phone: true } },
        },
    });

    // Send shipping notification email to customer
    if (finalOrder?.awbCode && finalOrder?.user?.email) {
        try {
            const emailHtml = getShippingNotificationTemplate({
                userName: finalOrder.user.name,
                orderNumber: finalOrder.orderNumber,
                awbCode: finalOrder.awbCode,
                courierName: finalOrder.courierName,
                shippingAddress: finalOrder.shippingAddress,
                orderDate: new Date().toLocaleDateString("en-IN"),
            });

            await sendEmail({
                email: finalOrder.user.email,
                subject: `Your Order #${finalOrder.orderNumber} Has Been Shipped! - Tracking: ${finalOrder.awbCode}`,
                html: emailHtml,
            });

            console.log(`[BOOK] Shipping notification email sent to ${finalOrder.user.email} for order ${finalOrder.orderNumber}`);
        } catch (emailError) {
            console.error(`[BOOK] Failed to send shipping email (non-critical):`, emailError.message);
        }
    }

    res.status(200).json(
        new ApiResponsive(200, { order: finalOrder }, "Shipment booked successfully")
    );
});

// Re-sync order with Shiprocket — fix stuck orders
export const resyncOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            orderNumber: true,
            shiprocketOrderId: true,
            shiprocketShipmentId: true,
            awbCode: true,
            shiprocketStatus: true,
            status: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    console.log(`[RESYNC] Order ${order.orderNumber} — SROrderId: ${order.shiprocketOrderId}, SRShipmentId: ${order.shiprocketShipmentId}, AWB: ${order.awbCode}, SRStatus: ${order.shiprocketStatus}`);

    // If order has no Shiprocket order at all, create fresh
    if (!order.shiprocketOrderId) {
        console.log(`[RESYNC] No Shiprocket order. Creating fresh...`);
        const result = await processOrderForShipping(orderId);
        if (!result) {
            throw new ApiError(400, "Shiprocket is disabled or configuration is missing.");
        }

        const updatedOrder = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                shiprocketOrderId: true, shiprocketShipmentId: true, awbCode: true,
                courierName: true, shiprocketStatus: true,
            },
        });

        return res.status(200).json(
            new ApiResponsive(200, { order: updatedOrder, action: "created" }, "Order synced to Shiprocket successfully")
        );
    }

    // If order has shiprocketOrderId but no shipmentId, fetch from Shiprocket
    if (order.shiprocketOrderId && !order.shiprocketShipmentId) {
        console.log(`[RESYNC] Fetching shipment ID from Shiprocket for order_id=${order.shiprocketOrderId}...`);
        try {
            const srOrderDetails = await getShiprocketOrderDetails(order.shiprocketOrderId);
            const shipmentId = srOrderDetails?.order?.shipment_id || srOrderDetails?.shipment_id || null;
            if (shipmentId) {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { shiprocketShipmentId: shipmentId, shiprocketStatus: "CREATED" },
                });
                console.log(`[RESYNC] Recovered shipment_id=${shipmentId}`);
            } else {
                console.warn(`[RESYNC] Could not recover shipment_id. Response:`, JSON.stringify(srOrderDetails));
                throw new ApiError(400, "Could not recover shipment ID from Shiprocket. Order may need to be re-created.");
            }
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(400, `Failed to fetch order details from Shiprocket: ${error.message}`);
        }
    }

    // If order has both IDs but no AWB, try to fetch current status
    if (order.shiprocketOrderId && order.shiprocketShipmentId && !order.awbCode) {
        console.log(`[RESYNC] Order has shipment ID but no AWB. Checking Shiprocket status...`);
        try {
            const srOrderDetails = await getShiprocketOrderDetails(order.shiprocketOrderId);
            const srStatus = srOrderDetails?.order?.status || srOrderDetails?.status;
            const shipmentId = srOrderDetails?.order?.shipment_id || srOrderDetails?.shipment_id || order.shiprocketShipmentId;

            // Update with any new info from Shiprocket
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    shiprocketShipmentId: shipmentId,
                    shiprocketStatus: srStatus || order.shiprocketStatus,
                },
            });

            console.log(`[RESYNC] Updated order status: ${srStatus}`);
        } catch (error) {
            console.error(`[RESYNC] Failed to fetch status:`, error.message);
        }
    }

    const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketOrderId: true, shiprocketShipmentId: true, awbCode: true,
            courierName: true, shiprocketStatus: true,
        },
    });

    res.status(200).json(
        new ApiResponsive(200, { order: updatedOrder, action: "resynced" }, "Order re-synced with Shiprocket")
    );
});
