"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchApi("/public/products?newArrival=true&limit=12");
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-[#092D15]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#C9933A]/10 rounded-2xl h-80 skeleton border border-[#C9933A]/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-12 md:py-16 bg-[#092D15]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14">
          <div>
            <span className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[#C9933A]/80 block mb-2">
              Just Dropped
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl font-semibold text-[#FDF6E3] leading-tight">
              New Arrivals
            </h2>
            <p className="font-cormorant italic text-[#FDF6E3]/75 text-xl mt-1">
              Freshly crafted, just for you
            </p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#C9933A]/60 to-transparent mt-4" />
          </div>
          <Link href="/products?sort=newest" className="shrink-0">
            <button className="btn-gold gap-2 text-sm">
              View All New Arrivals <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Products Carousel */}
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

        {/* View All */}
        <div className="text-center mt-12">
          <Link href="/products?sort=newest">
            <button className="btn-gold gap-2">
              View All New Arrivals <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
