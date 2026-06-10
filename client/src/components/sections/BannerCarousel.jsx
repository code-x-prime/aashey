"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApi } from "@/lib/utils";

const STATIC_BANNERS = [
  { desktopImage: "/desk-1.png", mobileImage: "/mob-1.jpeg", alt: "Pure A2 Cow Ghee - Banner 1", link: "/products" },
  { desktopImage: "/desk-2.png", mobileImage: "/mob-2.png",  alt: "Pure A2 Cow Ghee - Banner 2", link: "/products" },
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState(STATIC_BANNERS);
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Fetch banners from DB; fall back to static if empty
  useEffect(() => {
    fetchApi("/public/banners")
      .then((res) => {
        const dbBanners = res?.data?.banners || [];
        const active = dbBanners.filter((b) => b.isActive);
        if (active.length > 0) {
          setBanners(
            active.map((b) => ({
              desktopImage: b.desktopImage,
              mobileImage: b.mobileImage || b.desktopImage,
              alt: b.alt || "Aashey Banner",
              link: b.link || "/products",
            }))
          );
        }
      })
      .catch(() => {}); // keep static fallback on error
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  // Touch swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? nextSlide() : prevSlide();
      setIsAutoPlaying(false);
    }
    touchStartX.current = null;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <Link key={index} href={banner.link} className="relative min-w-full block">
              {/* Desktop */}
              <div className="hidden md:block w-full">
                <Image
                  src={banner.desktopImage}
                  alt={banner.alt}
                  width={1920}
                  height={650}
                  quality={95}
                  className="w-full h-auto aspect-[1900/650] object-cover object-center"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
              {/* Mobile */}
              <div className="block md:hidden w-full">
                <Image
                  src={banner.mobileImage}
                  alt={banner.alt}
                  width={800}
                  height={600}
                  quality={90}
                  className="w-full h-auto aspect-[800/600] object-cover object-center"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={(e) => { e.preventDefault(); prevSlide(); setIsAutoPlaying(false); }}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#3F1F00]/70 backdrop-blur-sm border border-[#C9933A]/60 items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00] transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); nextSlide(); setIsAutoPlaying(false); }}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#3F1F00]/70 backdrop-blur-sm border border-[#C9933A]/60 items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00] transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => { setCurrent(index); setIsAutoPlaying(false); }}
                className={`rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-7 h-2.5 bg-[#C9933A]"
                    : "w-2.5 h-2.5 bg-[#C9933A]/40 hover:bg-[#C9933A]/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
