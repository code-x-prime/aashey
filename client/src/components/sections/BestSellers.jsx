"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { ArrowRight, Flame } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchApi("/public/products?bestseller=true&limit=12");
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="h-4 w-24 bg-[#C9933A]/20 rounded skeleton mb-3" />
              <div className="h-10 w-48 bg-[#C9933A]/15 rounded skeleton mb-2" />
              <div className="h-4 w-40 bg-[#C9933A]/10 rounded skeleton" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
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
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14">
          <div>
            <span className="section-eyebrow flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#C9933A]" /> Most Loved
            </span>
            <h2 className="section-title mt-2">Best Sellers</h2>
            <p className="font-cormorant italic text-[#6B4423] text-lg mt-1">
              Trusted by thousands across India
            </p>
            <div className="section-underline mt-4" />
          </div>
          <Link href="/products?sort=popular" className="shrink-0">
            <button className="btn-outline gap-2 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-[#3F1F00] hover:bg-[#C9933A] text-[#C9933A] hover:text-[#3F1F00] border-0 shadow-lg" />
            <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-[#3F1F00] hover:bg-[#C9933A] text-[#C9933A] hover:text-[#3F1F00] border-0 shadow-lg" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default BestSellers;
