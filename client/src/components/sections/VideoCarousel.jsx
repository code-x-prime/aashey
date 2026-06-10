"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchApi } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export default function VideoCarousel() {
  const [videos, setVideos] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const autoScrollRef = useRef(null);
  const videoRefs = useRef({});

  useEffect(() => {
    fetchApi("/public/videos")
      .then((res) => {
        if (res.success) {
          setVideos(res.data.videos || []);
          setAutoScroll(res.data.autoScroll ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Videos per view — responsive
  const getPerView = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [perView, setPerView] = useState(3);

  useEffect(() => {
    const update = () => setPerView(getPerView());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIdx = Math.max(0, videos.length - perView);

  const next = useCallback(() => {
    setCurrentIdx((i) => (i >= maxIdx ? 0 : i + 1));
  }, [maxIdx]);

  const prev = useCallback(() => {
    setCurrentIdx((i) => (i <= 0 ? maxIdx : i - 1));
  }, [maxIdx]);

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll || videos.length <= perView || playingId) return;
    autoScrollRef.current = setInterval(next, 4000);
    return () => clearInterval(autoScrollRef.current);
  }, [autoScroll, videos.length, perView, playingId, next]);

  const handlePlayPause = (videoId, el) => {
    if (playingId === videoId) {
      el.pause();
      setPlayingId(null);
    } else {
      // Pause currently playing
      if (playingId && videoRefs.current[playingId]) {
        videoRefs.current[playingId].pause();
      }
      el.play().catch(() => {});
      setPlayingId(videoId);
    }
  };

  if (loading || videos.length === 0) return null;

  const visibleVideos = videos.slice(currentIdx, currentIdx + perView);

  return (
    <section className="py-12 md:py-16 bg-[#FDF6E3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-[#C9933A] block mb-2">
              Our Story
            </span>
            <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-[#3F1F00] leading-tight">
              See It For Yourself
            </h2>
            <div className="w-10 h-px bg-gradient-to-r from-[#C9933A] to-transparent mt-3" />
          </div>

          {/* Nav buttons */}
          {videos.length > perView && (
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full border border-[#C9933A]/30 bg-white flex items-center justify-center text-[#3F1F00] hover:bg-[#C9933A] hover:text-white hover:border-[#C9933A] transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full border border-[#C9933A]/30 bg-white flex items-center justify-center text-[#3F1F00] hover:bg-[#C9933A] hover:text-white hover:border-[#C9933A] transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Videos grid */}
        <div className={`grid gap-4 ${perView === 1 ? "grid-cols-1" : perView === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {visibleVideos.map((video) => (
            <div
              key={video.id}
              className="relative aspect-[9/16] bg-[#1F1F1F] rounded-2xl overflow-hidden shadow-md group cursor-pointer"
              onClick={() => {
                const el = videoRefs.current[video.id];
                if (el) handlePlayPause(video.id, el);
              }}
            >
              <video
                ref={(el) => { if (el) videoRefs.current[video.id] = el; }}
                src={video.publicUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={playingId !== video.id}
                preload="metadata"
                onEnded={() => setPlayingId(null)}
              />

              {/* Overlay */}
              <div className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${playingId === video.id ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`} />

              {/* Play/Pause button */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${playingId === video.id ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                  {playingId === video.id
                    ? <Pause className="w-6 h-6 text-white" />
                    : <Play className="w-6 h-6 text-white ml-0.5" />}
                </div>
              </div>

              {/* Title */}
              {video.title && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="font-sans text-[12px] font-medium text-white/90 line-clamp-2">{video.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {videos.length > perView && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`rounded-full transition-all duration-200 ${i === currentIdx ? "w-6 h-1.5 bg-[#C9933A]" : "w-1.5 h-1.5 bg-[#C9933A]/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
