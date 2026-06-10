import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Trash2, Loader2, Video, Play, Eye, EyeOff,
  ChevronUp, ChevronDown, RefreshCw, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { cn } from "@/lib/utils";

interface VideoItem {
  id: string;
  title: string | null;
  url: string;
  publicUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function VideoManagementPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<{ id: string; value: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    try {
      const res = await api.get("/api/admin/videos");
      if (res.data.success) {
        setVideos(res.data.data.videos || []);
        setAutoScroll(res.data.data.settings?.autoScroll ?? true);
      }
    } catch {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mb = file.size / (1024 * 1024);
    if (mb > 100) { toast.error(`File too large (${mb.toFixed(1)}MB). Max 100MB.`); return; }

    const fd = new FormData();
    fd.append("video", file);
    fd.append("title", file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));

    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await api.post("/api/admin/videos", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      if (res.data.success) {
        toast.success("Video uploaded!");
        fetchVideos();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleActive = async (video: VideoItem) => {
    setTogglingId(video.id);
    try {
      await api.put(`/api/admin/videos/${video.id}`, { isActive: !video.isActive });
      setVideos((prev) => prev.map((v) => v.id === video.id ? { ...v, isActive: !v.isActive } : v));
    } catch { toast.error("Update failed"); }
    finally { setTogglingId(null); }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this video? Cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/admin/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast.success("Video deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const moveVideo = async (id: string, direction: "up" | "down") => {
    const idx = videos.findIndex((v) => v.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === videos.length - 1)) return;

    const newVideos = [...videos];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newVideos[idx], newVideos[swapIdx]] = [newVideos[swapIdx], newVideos[idx]];

    const withOrder = newVideos.map((v, i) => ({ ...v, order: i }));
    setVideos(withOrder);

    try {
      await api.put("/api/admin/videos/reorder", {
        order: withOrder.map((v) => ({ id: v.id, order: v.order })),
      });
    } catch { toast.error("Reorder failed"); fetchVideos(); }
  };

  const saveTitle = async (id: string, title: string) => {
    try {
      await api.put(`/api/admin/videos/${id}`, { title: title.trim() || null });
      setVideos((prev) => prev.map((v) => v.id === id ? { ...v, title: title.trim() || null } : v));
      toast.success("Title saved");
    } catch { toast.error("Save failed"); }
    setEditingTitle(null);
  };

  const toggleAutoScroll = async () => {
    const next = !autoScroll;
    setAutoScroll(next);
    try {
      await api.put("/api/admin/videos/settings", { autoScroll: next });
      toast.success(`Auto-scroll ${next ? "enabled" : "disabled"}`);
    } catch { setAutoScroll(!next); toast.error("Update failed"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2937]">Video Section</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            Manage videos shown on the homepage. Max 100MB per video.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-scroll toggle */}
          <button
            onClick={toggleAutoScroll}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
              autoScroll
                ? "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]"
                : "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]"
            )}
          >
            {autoScroll ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>

          {/* Upload button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#4CAF50] hover:bg-[#43A047] text-white gap-2"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{uploadProgress}%</>
            ) : (
              <><Upload className="h-4 w-4" />Upload Video</>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="w-full bg-[#E5E7EB] rounded-full h-2">
          <div
            className="bg-[#4CAF50] h-2 rounded-full transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[#6B7280]">
          <span className="font-semibold text-[#1F2937]">{videos.length}</span> total videos
        </span>
        <span className="text-[#6B7280]">
          <span className="font-semibold text-emerald-600">{videos.filter((v) => v.isActive).length}</span> active
        </span>
        <Button variant="ghost" size="sm" onClick={fetchVideos} className="h-7 px-2 gap-1 text-xs text-[#9CA3AF]">
          <RefreshCw className="h-3 w-3" />Refresh
        </Button>
      </div>

      {/* Videos list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
        </div>
      ) : videos.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Video className="h-12 w-12 text-[#D1D5DB]" />
            <p className="text-sm font-medium text-[#6B7280]">No videos uploaded yet</p>
            <p className="text-xs text-[#9CA3AF]">Click "Upload Video" to add your first video</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {videos.map((video, idx) => (
            <Card key={video.id} className={cn("border-[#E5E7EB]", !video.isActive && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Order controls */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveVideo(video.id, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-[#F3F4F6] disabled:opacity-20 text-[#6B7280]"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-center text-[#9CA3AF] font-mono">{idx + 1}</span>
                    <button
                      onClick={() => moveVideo(video.id, "down")}
                      disabled={idx === videos.length - 1}
                      className="p-1 rounded hover:bg-[#F3F4F6] disabled:opacity-20 text-[#6B7280]"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Video preview */}
                  <div className="w-24 h-16 bg-[#1F2937] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    <video
                      src={video.publicUrl}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingTitle?.id === video.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editingTitle.value}
                          onChange={(e) => setEditingTitle({ id: video.id, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle(video.id, editingTitle.value);
                            if (e.key === "Escape") setEditingTitle(null);
                          }}
                          className="flex-1 text-sm border border-[#4CAF50] rounded px-2 py-1 outline-none"
                        />
                        <Button size="sm" className="h-7 bg-[#4CAF50] hover:bg-[#43A047] text-xs" onClick={() => saveTitle(video.id, editingTitle.value)}>Save</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingTitle(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <p
                        className="text-sm font-semibold text-[#1F2937] cursor-pointer hover:text-[#4CAF50] truncate"
                        onClick={() => setEditingTitle({ id: video.id, value: video.title || "" })}
                        title="Click to edit title"
                      >
                        {video.title || <span className="text-[#9CA3AF] font-normal italic">No title — click to add</span>}
                      </p>
                    )}
                    <p className="text-xs text-[#9CA3AF] mt-0.5 font-mono truncate">{video.url.split("/").pop()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs border px-2 py-0", video.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
                        {video.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Preview */}
                    <a href={video.publicUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#1F2937]"
                      title="Preview">
                      <Play className="h-4 w-4" />
                    </a>

                    {/* Toggle active */}
                    <button
                      onClick={() => toggleActive(video)}
                      disabled={togglingId === video.id}
                      className="p-2 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#1F2937]"
                      title={video.isActive ? "Deactivate" : "Activate"}
                    >
                      {togglingId === video.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : video.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteVideo(video.id)}
                      disabled={deletingId === video.id}
                      className="p-2 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500"
                      title="Delete"
                    >
                      {deletingId === video.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-[#9CA3AF] text-center">
        Videos appear on the homepage above "What Our Customers Say". Drag order with ↑↓ buttons.
      </p>
    </div>
  );
}
