"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { getCategoryImageUrl } from "@/lib/imageUrl";

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ──── API ────
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

  // ──── LOADING skeleton ────
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

  // Duplicate items for seamless infinite loop
  const loopCats = [...categories, ...categories];

  return (
    <section className="py-10 md:py-14 bg-[#FDF6E3] overflow-hidden">

      {/* ──── Section Header ──── */}
      <div className="text-center mb-12 md:mb-16 px-4">
        <span className="section-eyebrow block mb-3">Explore Our Range</span>
        <h2 className="section-title">Shop By Category</h2>
        <div className="section-underline-center mt-5" />
      </div>

      {/* ──── Carousel ──── */}
      <div className="relative max-w-7xl mx-auto">

        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #FDF6E3 0%, transparent 100%)" }}
        />

        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #FDF6E3 0%, transparent 100%)" }}
        />

        <div className="overflow-hidden">
          <div
            className="flex items-start gap-6 md:gap-8 py-4 px-8 animate-categories-marquee hover:[animation-play-state:paused]"
            style={{ width: "max-content" }}
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
                <span className="font-sans font-semibold text-sm md:text-base text-[#3F1F00] group-hover:text-[#C9933A] transition-colors duration-200 text-center max-w-[130px] leading-tight">
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
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </div>

    </section>
  );
}
