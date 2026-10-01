import express from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateTracking,
  createOrder,
  processPayment,
  getOrderStats,
  cleanupInvalidPartnerEarnings,
  updateOrderItemQuantity,
  getPreOrders,
  releasePreOrder,
} from "../controllers/admin.order.controller.js";
import {
  verifyAdminJWT,
  hasPermission,
} from "../middlewares/admin.middleware.js";

const router = express.Router();

// Order routes
router.get(
  "/orders",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getOrders
);

// Pre-Order routes — must be registered BEFORE the "/orders/:orderId" wildcard
// below, otherwise Express would match "/orders/pre-orders" to it instead.
router.get(
  "/orders/pre-orders",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getPreOrders
);

router.post(
  "/orders/:orderId/release-pre-order",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  releasePreOrder
);

router.get(
  "/orders/:orderId",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getOrderById
);

router.patch(
  "/orders/:orderId/status",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateOrderStatus
);

router.patch(
  "/orders/:orderId/fix-item",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateOrderItemQuantity
);

router.patch(
  "/orders/:orderId/tracking",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateTracking
);

router.post(
  "/orders",
  verifyAdminJWT,
  hasPermission("orders", "create"),
  createOrder
);

router.post(
  "/orders/:orderId/process-payment",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  processPayment
);

// Order statistics
router.get(
  "/orders-stats",
  verifyAdminJWT,
  hasPermission("dashboard", "read"),
  getOrderStats
);

// Cleanup invalid partner earnings (Admin only)
router.post(
  "/cleanup-partner-earnings",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  cleanupInvalidPartnerEarnings
);

export default router;
