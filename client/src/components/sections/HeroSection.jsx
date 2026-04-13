"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApi } from "@/lib/utils";

const fallbackSlides = [
  {
    headline: "Pure A2 Cow Ghee",
    desktopImage: "/ban1.png",
    mobileImage: "/ban-m1.png",
    link: "/products",
    cta: "Shop Now"
  },
  {
    headline: "Pure A2 Cow Ghee",
    desktopImage: "/ban2.png",
    mobileImage: "/ban-m2.png",
    link: "/products",
    cta: "Shop Now"
  },
];

export default function HeroSection() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetchApi("/public/banners");
        if (res?.success && Array.isArray(res.data?.banners) && res.data.banners.length > 0) {
          const apiSlides = res.data.banners.map((banner) => ({
            headline: banner.title || "Premium Products",
            subheadline: banner.subtitle || "Shop With Confidence",
            description: banner.description || "",
            desktopImage: banner.desktopImage,
            mobileImage: banner.mobileImage || banner.desktopImage,
            link: banner.link || "/products",
            cta: "Shop Now"
          }));
          setSlides(apiSlides);
        }
      } catch (err) {
        console.error("Banner fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#3F1F00]">
        <div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#3F1F00]">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`relative w-full transition-opacity duration-700 ${
            index === current ? "opacity-100 block" : "opacity-0 hidden"
          }`}
        >
          {/* Desktop Image */}
          <div className="hidden md:block relative w-full">
            <Image
              src={slide.desktopImage}
              alt={slide.headline || "Banner"}
              width={2000}
              height={1000}
              className="w-full h-auto md:h-[85vh]"
              priority={index === 0}
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>

          {/* Mobile Image */}
          <div className="block md:hidden relative w-full">
            <Image
              src={slide.mobileImage}
              alt={slide.headline || "Banner"}
              width={1000}
              height={1000}
              className="w-full h-auto md:h-[85vh]"
              priority={index === 0}
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#3F1F00]/70 backdrop-blur-sm border border-[#C9933A]/60 items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00] hover:border-[#C9933A] transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#3F1F00]/70 backdrop-blur-sm border border-[#C9933A]/60 items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00] hover:border-[#C9933A] transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`rounded-full transition-all duration-300 ${
                index === current
                  ? "w-8 h-2.5 bg-[#C9933A]"
                  : "w-2.5 h-2.5 bg-[#C9933A]/40 hover:bg-[#C9933A]/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}