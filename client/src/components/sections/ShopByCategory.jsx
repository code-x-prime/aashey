"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { getCategoryImageUrl } from "@/lib/imageUrl";

import { RiArrowRightUpLine, RiGridLine, RiBox3Line } from "react-icons/ri";

export function ShopByCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

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

  /* ── Loading ─────────────────────────────────── */
  if (loading) {
    return (
      <section className="py-10 md:py-16 bg-[#3F1F00]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-12">
            <div className="h-3 w-20 bg-white/10 rounded skeleton mx-auto mb-3" />
            <div className="h-10 w-52 bg-white/10 rounded skeleton mx-auto mb-2" />
            <div className="h-4 w-36 bg-white/8 rounded skeleton mx-auto mt-2" />
          </div>
          {/* Featured + grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-2 row-span-2 rounded-2xl bg-white/8 skeleton h-72 md:h-auto md:aspect-[4/5]" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/8 skeleton aspect-[4/3] md:aspect-square" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  const featured   = categories[0];
  const rest       = categories.slice(1, 7);

  return (
    <section className="py-10 md:py-16 bg-[#3F1F00] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
          <div>
            <span className="font-sans text-[10px] font-semibold tracking-[0.28em] uppercase text-[#C9933A]/60 flex items-center gap-2 mb-3">
              <RiGridLine className="w-3 h-3" /> Explore
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl font-semibold text-[#FDF6E3] leading-tight">
              Shop By Category
            </h2>
            <p className="font-cormorant italic text-[#FDF6E3]/60 text-xl mt-1">
              Find your perfect ghee
            </p>
            <div className="w-12 h-px bg-gradient-to-r from-[#C9933A]/70 to-transparent mt-4" />
          </div>

          {categories.length > 7 && (
            <Link href="/categories" className="hidden md:inline-flex items-center gap-2 font-sans text-[13px] font-medium text-[#C9933A]/70 hover:text-[#C9933A] transition-colors group">
              View all categories
              <RiArrowRightUpLine className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>

        {/* ── Bento Grid ─────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-3 md:gap-4">

          {/* ── Featured card (tall, col+row span) ── */}
          <CategoryCard
            category={featured}
            className="col-span-1 row-span-2 md:col-span-1 md:row-span-2"
            isHovered={hoveredId === featured.id}
            onHover={setHoveredId}
            size="large"
          />

          {/* ── Rest of cards ── */}
          {rest.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              className="col-span-1 row-span-1"
              isHovered={hoveredId === cat.id}
              onHover={setHoveredId}
              size="small"
            />
          ))}
        </div>

        {/* ── Mobile: View All ───────────────────── */}
        {categories.length > 7 && (
          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/categories"
              className="btn-gold gap-1.5 text-sm flex items-center justify-center w-full max-w-[240px] mx-auto"
            >
              View All Categories <RiArrowRightUpLine className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Category Card ───────────────────────────────── */
function CategoryCard({ category, className = "", isHovered, onHover, size = "small" }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl block ${className}`}
      onMouseEnter={() => onHover(category.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Image */}
      <Image
        src={getCategoryImageUrl(category.image)}
        alt={category.name}
        fill
        className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Base overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0600]/90 via-[#0D0600]/20 to-transparent" />

      {/* Hover tint */}
      <div className={`absolute inset-0 bg-[#C9933A]/10 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />

      {/* Product count pill */}
      {category._count?.products > 0 && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 z-10">
          <RiBox3Line className="w-3 h-3 text-[#C9933A]" />
          <span className="font-sans text-[10px] font-semibold text-[#C9933A]/90 tracking-wide">
            {category._count.products}
          </span>
        </div>
      )}

      {/* Gold corner accent on hover */}
      <div className={`absolute top-0 right-0 w-10 h-10 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute top-0 right-0 w-full h-px bg-[#C9933A]/60" />
        <div className="absolute top-0 right-0 w-px h-full bg-[#C9933A]/60" />
      </div>
      <div className={`absolute bottom-0 left-0 w-10 h-10 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute bottom-0 left-0 w-full h-px bg-[#C9933A]/60" />
        <div className="absolute bottom-0 left-0 w-px h-full bg-[#C9933A]/60" />
      </div>

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Category name */}
        <h3 className={`font-cormorant font-bold text-white leading-tight transition-colors duration-300 ${isHovered ? "text-[#C9933A]" : ""} ${size === "large" ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>
          {category.name}
        </h3>

        {/* Subcat count or description */}
        {category.subCategories?.length > 0 && (
          <p className="font-sans text-[11px] text-white/40 mt-0.5">
            {category.subCategories.length} subcategories
          </p>
        )}

        {/* Explore row */}
        <div className={`flex items-center gap-1.5 mt-2 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
          <div className="w-4 h-px bg-[#C9933A]" />
          <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-[#C9933A] uppercase">
            Explore
          </span>
          <RiArrowRightUpLine className="w-3 h-3 text-[#C9933A]" />
        </div>
      </div>
    </Link>
  );
}

export default ShopByCategory;