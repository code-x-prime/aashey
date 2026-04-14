"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { ProductCard } from "@/components/products/ProductCard";

import { RiArrowRightLine, RiArrowLeftLine, RiArrowRightSLine, RiFireLine } from "react-icons/ri";

export function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(4);

  /* ── Fetch ─────────────────────────────────── */
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

  /* ── Responsive slides-per-view ────────────── */
  useEffect(() => {
    const update = () => setSlidesPerView(window.innerWidth < 768 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => { setCurrentIndex(0); }, [slidesPerView]);

  const maxIndex = Math.max(0, products.length - slidesPerView);
  const canPrev  = currentIndex > 0;
  const canNext  = currentIndex < maxIndex;
  const totalDots = maxIndex + 1;

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  /* ── Arrow button shared style ──────────────── */
  const arrowBtn = (enabled) =>
    `w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
      enabled
        ? "border-[#C9933A] text-[#C9933A] hover:bg-[#C9933A] hover:text-white"
        : "border-[#C9933A]/25 text-[#C9933A]/30 cursor-not-allowed"
    }`;

  /* ── Loading skeleton ───────────────────────── */
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

  const gap = slidesPerView === 2 ? 12 : 20;

  return (
    <section className="py-10 md:py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">

        {/* ── Header ────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
          <div>
            <span className="section-eyebrow flex items-center gap-1.5">
              <RiFireLine className="w-3.5 h-3.5 text-[#C9933A]" /> Most Loved
            </span>
            <h2 className="section-title mt-2">Best Sellers</h2>
            <p className="font-cormorant italic text-[#6B4423] text-lg mt-1">
              Trusted by thousands across India
            </p>
            <div className="section-underline mt-4" />
          </div>

          {/* Desktop: arrows + view all */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={prev} disabled={!canPrev} aria-label="Previous" className={arrowBtn(canPrev)}>
                <RiArrowLeftLine className="w-4 h-4" />
              </button>
              <button onClick={next} disabled={!canNext} aria-label="Next" className={arrowBtn(canNext)}>
                <RiArrowRightLine className="w-4 h-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-[#C9933A]/20" />
            <Link href="/products?sort=popular">
              <button className="btn-outline gap-1.5 text-sm px-4 py-2">
                View All <RiArrowRightSLine className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* ── Carousel Track ────────────────────── */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{
                gap: `${gap}px`,
                transform: `translateX(calc(-${currentIndex} * (100% / ${slidesPerView} + ${gap / slidesPerView}px)))`,
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0"
                  style={{ width: `calc(100% / ${slidesPerView} - ${gap * (slidesPerView - 1) / slidesPerView}px)` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Right fade hint — mobile */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden" />
        </div>

        {/* ── Mobile Bottom Controls ─────────────── */}
        <div className="flex items-center justify-between mt-6 md:hidden">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-5 h-1.5 bg-[#C9933A]" : "w-1.5 h-1.5 bg-[#C9933A]/30"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={!canPrev} aria-label="Previous"
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${canPrev ? "border-[#C9933A] text-[#C9933A]" : "border-[#C9933A]/20 text-[#C9933A]/25 cursor-not-allowed"}`}>
              <RiArrowLeftLine className="w-3.5 h-3.5" />
            </button>
            <button onClick={next} disabled={!canNext} aria-label="Next"
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${canNext ? "border-[#C9933A] text-[#C9933A]" : "border-[#C9933A]/20 text-[#C9933A]/25 cursor-not-allowed"}`}>
              <RiArrowRightLine className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile: View All */}
        <div className="mt-5 flex justify-center md:hidden">
          <Link href="/products?sort=popular" className="w-full max-w-xs">
            <button className="btn-outline gap-1.5 text-sm px-5 py-2.5 w-full">
              View All <RiArrowRightSLine className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default BestSellers;