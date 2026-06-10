import express from "express";
import multer from "multer";
import { verifyAdminJWT, hasPermission } from "../middlewares/admin.middleware.js";
import {
  getVideos,
  createVideo,
  updateVideo,
  reorderVideos,
  deleteVideo,
  getVideoSettings,
  updateVideoSettings,
} from "../controllers/admin.video.controller.js";

const router = express.Router();

// 100MB limit for video uploads
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.get("/", verifyAdminJWT, hasPermission("products", "read"), getVideos);
router.post("/", verifyAdminJWT, hasPermission("products", "create"), videoUpload.single("video"), createVideo);
router.put("/reorder", verifyAdminJWT, hasPermission("products", "update"), reorderVideos);
router.put("/settings", verifyAdminJWT, hasPermission("products", "update"), updateVideoSettings);
router.get("/settings", verifyAdminJWT, hasPermission("products", "read"), getVideoSettings);
router.put("/:id", verifyAdminJWT, hasPermission("products", "update"), updateVideo);
router.delete("/:id", verifyAdminJWT, hasPermission("products", "delete"), deleteVideo);

export default router;
