"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { getCategoryImageUrl } from "@/lib/imageUrl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef(null);

  // ── API ──
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ── Auto-scroll (requestAnimationFrame infinite loop) ──
  useEffect(() => {
    const track = trackRef.current;
    if (!track || categories.length === 0) return;

    const SPEED = 0.6; // px per frame

    const animate = () => {
      if (!isPaused) {
        posRef.current += SPEED;
        const halfWidth = track.scrollWidth / 2;
        if (posRef.current >= halfWidth) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [categories, isPaused]);

  // ── Manual arrow scroll ──
  const scrollManual = useCallback((dir) => {
    const itemWidth = 196; // circle width + gap
    posRef.current += dir === "left" ? -itemWidth : itemWidth;
    if (posRef.current < 0) posRef.current = 0;
  }, []);

  // ── LOADING skeleton ──
  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-[#FDF6E3]">
        <div className="text-center mb-12">
          <div className="h-3 w-32 bg-[#C9933A]/20 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-56 bg-[#C9933A]/10 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="flex gap-8 justify-center overflow-hidden px-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-4 flex-shrink-0">
              <div className="w-40 h-40 md:w-44 md:h-44 rounded-full bg-[#C9933A]/10 animate-pulse" />
              <div className="h-4 w-24 bg-[#C9933A]/10 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  // Duplicate items for infinite loop
  const loopCats = [...categories, ...categories, ...categories];

  return (
    <section className="py-10 md:py-14 bg-[#FDF6E3] overflow-hidden">

      {/* ── Section Header ── */}
      <div className="text-center mb-12 md:mb-16 px-4">
        <span className="section-eyebrow block mb-3">Explore Our Range</span>
        <h2 className="section-title">Shop By Category</h2>
        <div className="section-underline-center mt-5" />
      </div>

      {/* ── Carousel ── */}
      <div className="relative max-w-7xl mx-auto">

        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #FDF6E3 0%, transparent 100%)" }}
        />

        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #FDF6E3 0%, transparent 100%)" }}
        />

        {/* Left arrow */}
        <button
          onClick={() => scrollManual("left")}
          aria-label="Scroll left"
          className="absolute left-4 top-[40%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#3F1F00] text-[#FDF6E3] flex items-center justify-center shadow-xl hover:bg-[#C9933A] hover:text-[#3F1F00] transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scrollManual("right")}
          aria-label="Scroll right"
          className="absolute right-4 top-[40%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#3F1F00] text-[#FDF6E3] flex items-center justify-center shadow-xl hover:bg-[#C9933A] hover:text-[#3F1F00] transition-all duration-200 hover:scale-110"
        >
          <ChevronRight size={20} />
        </button>

        {/* Scrollable track */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="overflow-hidden cursor-grab active:cursor-grabbing"
        >
          <div
            ref={trackRef}
            className="flex items-start gap-6 md:gap-8 py-4 px-8"
            style={{ width: "max-content", willChange: "transform" }}
          >
            {loopCats.map((category, idx) => (
              <Link
                key={`${category.id}-${idx}`}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-4 flex-shrink-0 group select-none"
                draggable={false}
              >
                {/* Circle */}
                <div
                  className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden flex-shrink-0 transition-all duration-400 ease-out
                    border-4 border-[#C9933A]/20 group-hover:border-[#C9933A]/70
                    shadow-[0_8px_30px_rgba(63,31,0,0.14)]
                    group-hover:shadow-[0_16px_48px_rgba(201,147,58,0.28)]
                    group-hover:-translate-y-3"
                  style={{ background: "#3F1F00" }}
                >
                  <Image
                    src={getCategoryImageUrl(category.image)}
                    alt={category.name}
                    width={176}
                    height={176}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    draggable={false}
                  />
                </div>

                {/* Name */}
                <span className="font-playfair font-semibold text-sm md:text-base text-[#3F1F00] group-hover:text-[#C9933A] transition-colors duration-200 text-center max-w-[130px] leading-tight">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* View All link */}
      <div className="text-center mt-10">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 font-sans font-semibold text-sm text-[#C9933A] hover:text-[#3F1F00] transition-colors duration-200 group"
        >
          View All Categories
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

    </section>
  );
}
