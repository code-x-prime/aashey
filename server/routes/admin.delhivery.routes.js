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
    listWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
} from "../controllers/admin.delhivery.controller.js";

const router = express.Router();

router.get("/settings", isAdmin, getSettings);
router.put("/settings", isAdmin, updateSettings);
router.post("/test-connection", isAdmin, testConnection);

router.get("/warehouses", isAdmin, listWarehouses);
router.post("/warehouses", isAdmin, createWarehouse);
router.put("/warehouses/:id", isAdmin, updateWarehouse);
router.delete("/warehouses/:id", isAdmin, deleteWarehouse);

router.get("/orders/:orderId/options", isAdmin, getOrderOptions);
router.post("/orders/:orderId/book", isAdmin, bookShipment);
router.get("/orders/:orderId/label", isAdmin, getLabel);
router.get("/orders/:orderId/tracking", isAdmin, getTracking);
router.post("/orders/:orderId/cancel", isAdmin, cancelShipment);

export default router;
