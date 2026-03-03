"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { fetchApi } from "@/lib/utils";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

// Skeleton loader
const ProductSkeleton = () => (
  <div className="bg-[#FDF6E3] rounded-lg overflow-hidden border border-[#C9933A]/15 animate-pulse">
    <div className="aspect-[4/5] w-full bg-[#C9933A]/10" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-[#C9933A]/10 rounded w-3/4" />
      <div className="h-5 bg-[#C9933A]/12 rounded w-1/2" />
    </div>
  </div>
);

export const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchApi("/public/products?trending=true&limit=12");
        setProducts(response?.data?.products || []);
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (error) return null;

  if (loading) {
    return (
      <section className="py-10 md:py-14 bg-[#FDF6E3]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="h-4 w-24 bg-[#C9933A]/20 rounded skeleton mb-3" />
              <div className="h-10 w-56 bg-[#C9933A]/15 rounded skeleton mb-2" />
              <div className="h-4 w-44 bg-[#C9933A]/10 rounded skeleton" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-[#FDF6E3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14">
          <div>
            <span className="section-eyebrow flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#C9933A]" /> What&apos;s Hot
            </span>
            <h2 className="section-title mt-2">Trending Now</h2>
            <p className="font-cormorant italic text-[#6B4423] text-lg mt-1">
              Smart choices from our community
            </p>
            <div className="section-underline mt-4" />
          </div>
          <Link href="/products?productType=trending" className="shrink-0">
            <button className="btn-outline gap-2 text-sm">
              View All Trending <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product, index) => (
                <CarouselItem
                  key={product.id || product.slug || index}
                  className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-[#3F1F00] hover:bg-[#C9933A] text-[#C9933A] hover:text-[#3F1F00] border-0 shadow-lg z-10" />
            <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-[#3F1F00] hover:bg-[#C9933A] text-[#C9933A] hover:text-[#3F1F00] border-0 shadow-lg z-10" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
