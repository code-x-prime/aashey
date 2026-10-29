/**
 * Delhivery Admin Routes
 */

import express from "express";
import { isAdmin } from "../middlewares/auth.middleware.js";
import {
    getSettings,
    updateSettings,
    testConnection,
    getOrderOptions,
    bookShipment,
    getLabel,
    getTracking,
    cancelShipment,
} from "../controllers/admin.delhivery.controller.js";

const router = express.Router();

router.get("/settings", isAdmin, getSettings);
router.put("/settings", isAdmin, updateSettings);
router.post("/test-connection", isAdmin, testConnection);

router.get("/orders/:orderId/options", isAdmin, getOrderOptions);
router.post("/orders/:orderId/book", isAdmin, bookShipment);
router.get("/orders/:orderId/label", isAdmin, getLabel);
router.get("/orders/:orderId/tracking", isAdmin, getTracking);
router.post("/orders/:orderId/cancel", isAdmin, cancelShipment);

export default router;
