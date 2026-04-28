"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { ProductCard } from "@/components/products/ProductCard";

import { RiArrowRightLine, RiArrowLeftLine, RiArrowRightSLine, RiSparklingLine } from "react-icons/ri";

export function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(4);

  /* ── Fetch ─────────────────────────────────── */
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

  /* ── Responsive slides-per-view ────────────── */
  useEffect(() => {
    const update = () => setSlidesPerView(window.innerWidth < 768 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => { setCurrentIndex(0); }, [slidesPerView]);

  const maxIndex  = Math.max(0, products.length - slidesPerView);
  const canPrev   = currentIndex > 0;
  const canNext   = currentIndex < maxIndex;
  const totalDots = maxIndex + 1;

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  /* ── Arrow style — inverted for dark bg ─────── */
  const arrowCls = (enabled) =>
    `rounded-full border flex items-center justify-center transition-all duration-200 ${
      enabled
        ? "border-[#C9933A] text-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00]"
        : "border-[#C9933A]/20 text-[#C9933A]/25 cursor-not-allowed"
    }`;

  /* ── Loading skeleton ───────────────────────── */
  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-[#092D15]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#C9933A]/10 rounded-2xl h-80 skeleton border border-[#C9933A]/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  const gap = slidesPerView === 2 ? 12 : 20;

  return (
    <section className="py-12 md:py-16 bg-[#092D15] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">

        {/* ── Header ────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14">
          <div>
            <span className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[#C9933A]/80 flex items-center gap-1.5 mb-2">
              <RiSparklingLine className="w-3.5 h-3.5" /> Just Dropped
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl font-semibold text-[#FDF6E3] leading-tight">
              New Arrivals
            </h2>
            <p className="font-cormorant italic text-[#FDF6E3]/75 text-xl mt-1">
              Freshly crafted, just for you
            </p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#C9933A]/60 to-transparent mt-4" />
          </div>

          {/* Desktop: arrows + view all */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={prev} disabled={!canPrev} aria-label="Previous" className={`w-9 h-9 ${arrowCls(canPrev)}`}>
                <RiArrowLeftLine className="w-4 h-4" />
              </button>
              <button onClick={next} disabled={!canNext} aria-label="Next" className={`w-9 h-9 ${arrowCls(canNext)}`}>
                <RiArrowRightLine className="w-4 h-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-[#C9933A]/20" />
            <Link 
              href="/products?sort=newest"
              className="btn-gold gap-1.5 text-sm"
            >
              View All New Arrivals <RiArrowRightSLine className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Carousel Track ────────────────────── */}
        <div className="relative">
          <div className="overflow-x-auto md:overflow-hidden snap-x snap-mandatory touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div
              className="flex md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{
                gap: `${gap}px`,
                transform: slidesPerView === 2 ? 'none' : `translateX(calc(-${currentIndex} * (100% / ${slidesPerView} + ${gap / slidesPerView}px)))`,
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 snap-start"
                  style={{ width: slidesPerView === 2 ? "calc(50vw - 22px)" : `calc(100% / ${slidesPerView} - ${gap * (slidesPerView - 1) / slidesPerView}px)` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Right fade — dark bg */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#092D15] to-transparent md:hidden" />
        </div>

        {/* ── Mobile Bottom Controls removed as requested ─────────────── */}

        {/* Mobile + Desktop bottom: View All */}
        <div className="text-center mt-10 md:mt-12">
          <Link 
            href="/products?sort=newest"
            className="btn-gold gap-1.5"
          >
            View All New Arrivals <RiArrowRightSLine className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

export default NewArrivals;