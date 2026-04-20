import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: { order: "asc" },
  });
  res.status(200).json(new ApiResponsive(200, announcements, "All announcements fetched successfully"));
});

export const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  res.status(200).json(new ApiResponsive(200, announcements, "Active announcements fetched successfully"));
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { text, link, isActive, isScrollable, order } = req.body;
  if (!text) throw new ApiError(400, "Text is required for announcement");

  const announcement = await prisma.announcement.create({
    data: { text, link, isActive: isActive ?? true, isScrollable: isScrollable ?? true, order: order || 0 },
  });
  res.status(201).json(new ApiResponsive(201, announcement, "Announcement created successfully"));
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, link, isActive, isScrollable, order } = req.body;
  
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Announcement not found");

  const announcement = await prisma.announcement.update({
    where: { id },
    data: { text, link, isActive, isScrollable, order },
  });
  res.status(200).json(new ApiResponsive(200, announcement, "Announcement updated successfully"));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Announcement not found");

  await prisma.announcement.delete({ where: { id } });
  res.status(200).json(new ApiResponsive(200, null, "Announcement deleted successfully"));
});

// For Reordering
export const bulkUpdateAnnouncementOrder = asyncHandler(async (req, res) => {
  const { announcements } = req.body;
  if (!announcements || !Array.isArray(announcements)) throw new ApiError(400, "Invalid announcements array");

  for (let i = 0; i < announcements.length; i++) {
    const item = announcements[i];
    await prisma.$executeRawUnsafe(
      `UPDATE "Announcement" SET "order" = ${i + 1} WHERE id = '${item.id}'`
    );
  }
  
  res.status(200).json(new ApiResponsive(200, { success: true }, "Announcement order updated successfully"));
});
