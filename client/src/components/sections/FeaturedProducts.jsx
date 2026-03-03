"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";

export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchApi("/public/products?featured=true&limit=12");
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-10 md:py-14 bg-[#FDF6E3]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="h-4 w-32 bg-[#C9933A]/20 rounded skeleton mb-3" />
              <div className="h-10 w-64 bg-[#C9933A]/15 rounded skeleton mb-2" />
              <div className="h-4 w-48 bg-[#C9933A]/10 rounded skeleton" />
            </div>
            <div className="h-10 w-32 bg-[#C9933A]/10 rounded-lg skeleton hidden md:block" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#C9933A]/8 rounded-xl overflow-hidden skeleton">
                <div className="aspect-[4/5] w-full bg-[#C9933A]/10" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#C9933A]/10 rounded w-3/4" />
                  <div className="h-5 bg-[#C9933A]/15 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-10 md:py-14 bg-[#FDF6E3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14">
          <div>
            <span className="section-eyebrow">Handpicked For You</span>
            <h2 className="section-title mt-2">Featured Products</h2>
            <p className="font-cormorant italic text-[#6B4423] text-lg mt-1">
              Exceptional quality, traditional craft
            </p>
            <div className="section-underline mt-4" />
          </div>
          <Link href="/products" className="shrink-0">
            <button className="btn-outline gap-2 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
