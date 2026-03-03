"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { getCategoryImageUrl } from "@/lib/imageUrl";
import { ArrowRight, Package } from "lucide-react";

export function ShopByCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <section className="py-10 md:py-14 bg-[#3F1F00]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-12">
            <div className="h-4 w-24 bg-white/10 rounded skeleton mx-auto mb-3" />
            <div className="h-10 w-56 bg-white/10 rounded skeleton mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-56 md:h-72 rounded-xl bg-white/10 skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="py-10 md:py-14 bg-[#3F1F00]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Header */}
        <div className="text-center mb-12 md:mb-14">
          <span className="font-sc text-xs tracking-[0.25em] uppercase text-[#C9933A]/70 block mb-2">Explore</span>
          <h2 className="font-cormorant text-4xl md:text-5xl font-semibold text-[#FDF6E3] leading-tight">
            Shop By Category
          </h2>
          <p className="font-cormorant italic text-[#FDF6E3]/75 text-xl mt-1">
            Find your perfect ghee
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#C9933A] to-transparent mx-auto mt-4" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] block"
            >
              {/* Background image */}
              <Image
                src={getCategoryImageUrl(category.image)}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Overlay — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A00]/90 via-[#1A0A00]/30 to-transparent transition-opacity duration-300" />

              {/* Product count badge */}
              {category._count?.products > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#3F1F00]/80 backdrop-blur-sm border border-[#C9933A]/30 rounded-full px-2.5 py-1 z-10">
                  <Package className="w-3 h-3 text-[#C9933A]" />
                  <span className="font-sc text-[10px] text-[#C9933A] tracking-wider">{category._count.products}</span>
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h3 className="font-playfair text-lg md:text-xl font-bold text-white leading-tight mb-1 group-hover:text-[#C9933A] transition-colors">
                  {category.name}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  <span className="font-sc text-xs tracking-[0.15em] text-[#C9933A] uppercase">Explore</span>
                  <ArrowRight className="w-3 h-3 text-[#C9933A]" />
                </div>
              </div>

              {/* Gold border on hover */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#C9933A]/50 transition-colors duration-300 pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* View All Categories */}
        {categories.length > 8 && (
          <div className="text-center mt-12">
            <Link href="/categories">
              <button className="btn-gold gap-2">
                View All Categories <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ShopByCategory;
