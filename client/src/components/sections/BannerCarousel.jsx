"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    desktopImage: "/ban3.png",
    mobileImage: "/ban-m3.png",
    alt: "Pure A2 Cow Ghee - Banner 1",
    link: "/products",
  },
  {
    desktopImage: "/ban4.png",
    mobileImage: "/ban-m4.png",
    alt: "Pure A2 Cow Ghee - Banner 2",
    link: "/products",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="relative w-full overflow-hidden rounded-2xl">

        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <Link
              key={index}
              href={banner.link}
              className="relative min-w-full block"
            >
              {/* Desktop */}
              <div className="hidden md:block w-full">
                <Image
                  src={banner.desktopImage}
                  alt={banner.alt}
                  width={2000}
                  height={800}
                  className="w-full h-auto md:h-[85vh]"
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
                  height={800}
                  className="w-full h-auto md:h-[85vh]"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={(e) => { e.preventDefault(); prevSlide(); }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#3F1F00]/70 backdrop-blur-sm border border-[#C9933A]/60 items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00] transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => { e.preventDefault(); nextSlide(); }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#3F1F00]/70 backdrop-blur-sm border border-[#C9933A]/60 items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00] transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`rounded-full transition-all duration-300 ${
                index === current
                  ? "w-7 h-2.5 bg-[#C9933A]"
                  : "w-2.5 h-2.5 bg-[#C9933A]/40 hover:bg-[#C9933A]/70"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}