import { Router } from "express";
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  bulkUpdateAnnouncementOrder,
} from "../controllers/announcement.controller.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";

const router = Router();

// All admin announcement routes are protected
router.use(verifyAdminJWT);

router.get("/", getAllAnnouncements);
router.post("/", createAnnouncement);
router.put("/reorder", bulkUpdateAnnouncementOrder);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;
