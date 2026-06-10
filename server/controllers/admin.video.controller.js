import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3client, { BUCKET_NAME, PUBLIC_URL, UPLOAD_FOLDER } from "../utils/s3client.js";

// Upload video to R2 (no sharp — direct upload)
const uploadVideoToR2 = async (file) => {
  const timestamp = Date.now();
  const sanitizedName = file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, "-");
  const filename = `${UPLOAD_FOLDER}/videos/${timestamp}-${sanitizedName}`;

  await s3client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype || "video/mp4",
    })
  );

  return filename;
};

// Get/init settings singleton
const getSettings = async () => {
  let settings = await prisma.videoSectionSettings.findFirst();
  if (!settings) {
    settings = await prisma.videoSectionSettings.create({ data: { autoScroll: true } });
  }
  return settings;
};

// GET /api/admin/videos
export const getVideos = asyncHandler(async (req, res) => {
  const videos = await prisma.videoSection.findMany({
    orderBy: { order: "asc" },
  });
  const settings = await getSettings();

  res.status(200).json(
    new ApiResponsive(200, {
      videos: videos.map((v) => ({ ...v, publicUrl: `${PUBLIC_URL}/${v.url}` })),
      settings,
    }, "Videos fetched successfully")
  );
});

// POST /api/admin/videos — upload new video
export const createVideo = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Video file is required");
  }

  const fileSizeMB = req.file.size / (1024 * 1024);
  if (fileSizeMB > 100) {
    throw new ApiError(400, `File too large: ${fileSizeMB.toFixed(1)}MB. Max 100MB.`);
  }

  const url = await uploadVideoToR2(req.file);

  // Get max order
  const maxOrder = await prisma.videoSection.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const video = await prisma.videoSection.create({
    data: { title: title || null, url, order: nextOrder, isActive: true },
  });

  res.status(201).json(
    new ApiResponsive(201, {
      video: { ...video, publicUrl: `${PUBLIC_URL}/${video.url}` },
    }, "Video uploaded successfully")
  );
});

// PUT /api/admin/videos/:id — update title / active / order
export const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, isActive, order } = req.body;

  const existing = await prisma.videoSection.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Video not found");

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);
  if (order !== undefined) updateData.order = parseInt(order);

  const video = await prisma.videoSection.update({ where: { id }, data: updateData });

  res.status(200).json(
    new ApiResponsive(200, {
      video: { ...video, publicUrl: `${PUBLIC_URL}/${video.url}` },
    }, "Video updated successfully")
  );
});

// PUT /api/admin/videos/reorder — bulk reorder
export const reorderVideos = asyncHandler(async (req, res) => {
  const { order } = req.body; // [{ id, order }, ...]

  if (!Array.isArray(order)) throw new ApiError(400, "order must be an array");

  await Promise.all(
    order.map(({ id, order: newOrder }) =>
      prisma.videoSection.update({ where: { id }, data: { order: parseInt(newOrder) } })
    )
  );

  res.status(200).json(new ApiResponsive(200, null, "Reordered successfully"));
});

// DELETE /api/admin/videos/:id
export const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await prisma.videoSection.findUnique({ where: { id } });
  if (!video) throw new ApiError(404, "Video not found");

  // Delete from R2
  try {
    await s3client.send(
      new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: video.url })
    );
  } catch (e) {
    console.error("R2 delete error:", e.message);
  }

  await prisma.videoSection.delete({ where: { id } });

  res.status(200).json(new ApiResponsive(200, null, "Video deleted successfully"));
});

// GET /api/admin/videos/settings
export const getVideoSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  res.status(200).json(new ApiResponsive(200, { settings }, "Settings fetched"));
});

// PUT /api/admin/videos/settings
export const updateVideoSettings = asyncHandler(async (req, res) => {
  const { autoScroll } = req.body;
  const settings = await getSettings();
  const updated = await prisma.videoSectionSettings.update({
    where: { id: settings.id },
    data: { autoScroll: Boolean(autoScroll) },
  });
  res.status(200).json(new ApiResponsive(200, { settings: updated }, "Settings updated"));
});

// GET /api/public/videos — for client
export const getPublicVideos = asyncHandler(async (req, res) => {
  const [videos, settings] = await Promise.all([
    prisma.videoSection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    getSettings(),
  ]);

  res.status(200).json(
    new ApiResponsive(200, {
      videos: videos.map((v) => ({ ...v, publicUrl: `${PUBLIC_URL}/${v.url}` })),
      autoScroll: settings.autoScroll,
    }, "Videos fetched successfully")
  );
});
