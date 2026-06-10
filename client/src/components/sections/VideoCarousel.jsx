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
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

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

  // Responsive perView: 5 desktop, 3 tablet, 2 mobile
  const [perView, setPerView] = useState(5);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 2 : w < 1024 ? 3 : 5);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIdx = Math.max(0, videos.length - perView);

  const next = useCallback(() => setCurrentIdx((i) => (i >= maxIdx ? 0 : i + 1)), [maxIdx]);
  const prev = useCallback(() => setCurrentIdx((i) => (i <= 0 ? maxIdx : i - 1)), [maxIdx]);

  // Auto-scroll (pauses when video playing)
  useEffect(() => {
    clearInterval(autoScrollRef.current);
    if (!autoScroll || videos.length <= perView || playingId) return;
    autoScrollRef.current = setInterval(next, 4000);
    return () => clearInterval(autoScrollRef.current);
  }, [autoScroll, videos.length, perView, playingId, next]);

  // Touch + mouse drag
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  const handlePlayPause = (videoId, el) => {
    if (playingId === videoId) {
      el.pause(); setPlayingId(null);
    } else {
      if (playingId && videoRefs.current[playingId]) videoRefs.current[playingId].pause();
      el.play().catch(() => {});
      setPlayingId(videoId);
    }
  };

  if (loading || videos.length === 0) return null;

  const visibleVideos = videos.slice(currentIdx, currentIdx + perView);

  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    5: "grid-cols-5",
  }[perView] || "grid-cols-3";

  return (
    <section className="py-12 md:py-16 bg-[#FDF6E3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">

        {/* Header */}
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

          {videos.length > perView && (
            <div className="flex items-center gap-2">
              <button onClick={prev}
                className="w-9 h-9 rounded-full border border-[#C9933A]/30 bg-white flex items-center justify-center text-[#3F1F00] hover:bg-[#C9933A] hover:text-white hover:border-[#C9933A] transition-all duration-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={next}
                className="w-9 h-9 rounded-full border border-[#C9933A]/30 bg-white flex items-center justify-center text-[#3F1F00] hover:bg-[#C9933A] hover:text-white hover:border-[#C9933A] transition-all duration-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Videos */}
        <div
          className={`grid gap-3 ${gridClass}`}
          style={{ touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {visibleVideos.map((video) => (
            <div
              key={video.id}
              className="relative aspect-[9/16] bg-[#1F1F1F] rounded-xl overflow-hidden shadow-md group cursor-pointer"
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

              {/* Play/Pause */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${playingId === video.id ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                  {playingId === video.id
                    ? <Pause className="w-5 h-5 text-white" />
                    : <Play className="w-5 h-5 text-white ml-0.5" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {videos.length > perView && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <button key={i} onClick={() => setCurrentIdx(i)}
                className={`rounded-full transition-all duration-200 ${i === currentIdx ? "w-6 h-1.5 bg-[#C9933A]" : "w-1.5 h-1.5 bg-[#C9933A]/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
