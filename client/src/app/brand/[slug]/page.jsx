"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import {
    AlertCircle,
    Zap,
    SlidersHorizontal,

} from "lucide-react";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
} from "react-icons/ri";
import { ProductCard } from "@/components/products/ProductCard";
import { ClientOnly } from "@/components/client-only";
import { getImageUrl } from "@/lib/imageUrl";

/* ─────────────────────────────────────────────
   SKELETON
   Matching the premium ProductCard layout
   Using brand colors for skeleton
───────────────────────────────────────────── */
function ProductCardSkeleton() {
    return (
        <div className="bg-[#FDF6E3] rounded-xl border border-[#C9933A]/10 overflow-hidden animate-pulse">
            <div className="aspect-[4/5] bg-[#C9933A]/5" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-[#C9933A]/10 rounded w-3/4" />
                <div className="h-3 bg-[#C9933A]/5 rounded w-1/2" />
                <div className="pt-2 flex justify-between items-center">
                    <div className="h-5 bg-[#C9933A]/10 rounded w-20" />
                    <div className="h-8 bg-[#C9933A]/20 rounded-lg w-16" />
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   BRAND PAGE CONTENT
───────────────────────────────────────────── */
function BrandPageContent({ slug }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const sortParam = searchParams.get("sort") || "createdAt";
    const orderParam = searchParams.get("order") || "desc";
    const pageParam = parseInt(searchParams.get("page")) || 1;

    const [brand, setBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        page: pageParam,
        limit: 15,
        total: 0,
        pages: 0,
    });

    const [filters, setFilters] = useState({
        sort: sortParam,
        order: orderParam,
    });

    /* ── Sync URL → Filters ── */
    useEffect(() => {
        setFilters({ sort: sortParam, order: orderParam });
    }, [sortParam, orderParam]);

    /* ── URL Builder ── */
    const updateURL = (f, p = 1) => {
        const params = new URLSearchParams();
        if (f.sort !== "createdAt" || f.order !== "desc") {
            params.set("sort", f.sort);
            params.set("order", f.order);
        }
        if (p > 1) params.set("page", p);

        const newURL = params.toString()
            ? `?${params.toString()}`
            : window.location.pathname;
        router.push(newURL, { scroll: false });
    };

    /* ── Fetch Brand Data ── */
    useEffect(() => {
        const fetchBrandData = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                queryParams.append("page", pagination.page);
                queryParams.append("limit", pagination.limit);

                const validSortFields = ["createdAt", "updatedAt", "name", "featured"];
                let sortField = filters.sort;
                if (!validSortFields.includes(sortField)) sortField = "createdAt";

                queryParams.append("sort", sortField);
                queryParams.append("order", filters.order);

                const res = await fetchApi(`/public/brand/${slug}?${queryParams.toString()}`);

                if (res.success) {
                    setBrand(res.data.brand);
                    setProducts(res.data.brand.products || []);
                    setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, pages: 0 });
                } else {
                    throw new Error(res.message || "Failed to load brand");
                }
            } catch (err) {
                setError(err.message);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBrandData();
    }, [slug, filters, pagination.page, pagination.limit]);

    /* ── Handlers ── */
    const handleSortChange = (e) => {
        const map = {
            newest: ["createdAt", "desc"],
            oldest: ["createdAt", "asc"],
            "price-low": ["createdAt", "asc"],
            "price-high": ["createdAt", "desc"],
            "name-asc": ["name", "asc"],
            "name-desc": ["name", "desc"],
        };
        const [sort, order] = map[e.target.value] || ["createdAt", "desc"];
        const nf = { sort, order };
        setFilters(nf);
        updateURL(nf, 1);
        setPagination(p => ({ ...p, page: 1 }));
    };

    const handlePageChange = (p) => {
        if (p < 1 || p > pagination.pages) return;
        setPagination(prev => ({ ...prev, page: p }));
        updateURL(filters, p);

        // Smooth scroll to top of grid
        document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const currentSort = () => {
        if (filters.sort === "name" && filters.order === "asc") return "name-asc";
        if (filters.sort === "name" && filters.order === "desc") return "name-desc";
        if (filters.sort === "createdAt" && filters.order === "asc") return "oldest";
        return "newest";
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="font-cormorant text-3xl font-bold text-[#3F1F00] mb-2">Something went wrong</h2>
                <p className="font-sans text-sm text-[#8B6040] mb-8 max-w-xs leading-relaxed">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-8 py-3 bg-[#3F1F00] text-white rounded-xl font-semibold hover:bg-[#C9933A] transition-all duration-300 shadow-lg shadow-[#3F1F00]/10"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div id="products-grid">
            

            {/* Brand Hero Banner - Premium Brand Aesthetic */}
            <div className="relative w-full h-[220px] sm:h-[300px] rounded-[2rem] overflow-hidden mb-6 shadow-2xl border border-[#C9933A]/20">
                <Image
                    src={getImageUrl(brand?.image)}
                    alt={brand?.name || "Brand"}
                    fill
                    className="object-cover transition-transform duration-1000 hover:scale-105"
                    priority
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3F1F00]/90 via-[#3F1F00]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3F1F00]/40 via-transparent to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                    <div className="px-8 md:px-16 lg:px-20 max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9933A]/20 border border-[#C9933A]/40 text-[#C9933A] text-[10px] font-bold uppercase tracking-[0.2em] mb-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <Zap className="w-3 h-3" /> Brand Collection
                        </span>
                        <h1 className="font-cormorant text-4xl md:text-6xl font-bold text-[#FDF6E3] leading-[1.1] mb-4 drop-shadow-lg">
                            {brand?.name || "Our Brand"}
                        </h1>
                        <p className="font-sans text-sm md:text-base text-[#FDF6E3]/80 leading-relaxed max-w-lg line-clamp-3 md:line-clamp-none font-light">
                            {brand?.description || "Experience the pure essence of farm-fresh dairy from our premium brand collections. Traditionally crafted for modern wellness."}
                        </p>
                    </div>
                </div>

                {/* Decorative border accent */}
                <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20">
                    <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-[#C9933A]" />
                    <div className="absolute top-12 right-12 w-16 h-16 rounded-full border border-[#C9933A]" />
                </div>
            </div>

            {/* Controls Bar - Refined Style */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 sticky top-[72px] md:top-[88px] z-30 bg-[#FDF6E3]/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-[#C9933A]/15 shadow-xl shadow-[#3F1F00]/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3F1F00]/5 flex items-center justify-center text-[#C9933A]">
                        <SlidersHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-sans text-[11px] font-bold text-[#C9933A] uppercase tracking-widest">Collection</p>
                        <p className="font-sans text-sm text-[#3F1F00]">
                            {loading ? (
                                <span className="inline-block h-4 w-20 bg-[#C9933A]/10 rounded animate-pulse" />
                            ) : (
                                <><span className="font-bold">{pagination.total}</span> Pure Products</>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0 border border-[#C9933A]/20 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-[#C9933A]/50 transition-all duration-300">
                    <span className="px-4 py-3 text-[10px] font-bold text-[#C9933A] uppercase tracking-widest bg-[#FDF6E3] border-r border-[#C9933A]/20">
                        Sort By
                    </span>
                    <select
                        value={currentSort()}
                        onChange={handleSortChange}
                        disabled={loading}
                        className="px-5 py-3 text-[13px] font-medium text-[#3F1F00] focus:outline-none bg-white cursor-pointer appearance-none pr-10 relative"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23C9933A\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                    >
                        <option value="newest">Latest Arrivals</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name: A–Z</option>
                        <option value="name-desc">Name: Z–A</option>
                        <option value="oldest">Date: Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {loading && products.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-20 text-center border-2 border-dashed border-[#C9933A]/20">
                    <div className="w-20 h-20 bg-[#FDF6E3] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Zap className="h-10 w-10 text-[#C9933A] opacity-40" />
                    </div>
                    <h2 className="font-cormorant text-3xl font-bold text-[#3F1F00] mb-3">No Products Found</h2>
                    <p className="font-sans text-sm text-[#8B6040] max-w-sm mx-auto leading-relaxed">
                        We couldn&apos;t find any products in this brand at the moment. Please check back later or explore our other premium collections.
                    </p>
                </div>
            ) : (
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-all duration-500 ${loading ? "opacity-40 grayscale-[0.5]" : "opacity-100"}`}>
                    {products.map((product) => (
                        <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination - Premium Style */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-16 mb-12">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[#C9933A]/20 bg-white text-[#3F1F00] hover:border-[#C9933A] hover:bg-[#FDF6E3] disabled:opacity-30 disabled:hover:bg-white transition-all duration-300 shadow-sm"
                    >
                        <RiArrowLeftSLine className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(pagination.pages)].map((_, i) => {
                            const p = i + 1;
                            if (p === 1 || p === pagination.pages || (p >= pagination.page - 1 && p <= pagination.page + 1)) {
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        disabled={loading}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl text-[13px] font-bold transition-all duration-300 ${pagination.page === p
                                            ? "bg-[#3F1F00] text-white shadow-xl shadow-[#3F1F00]/20 scale-110"
                                            : "border border-[#C9933A]/20 bg-white text-[#3F1F00] hover:border-[#C9933A] hover:bg-[#FDF6E3]"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            if ((p === 2 && pagination.page > 3) || (p === pagination.pages - 1 && pagination.page < pagination.pages - 2)) {
                                return <span key={p} className="w-8 text-center text-[#C9933A] font-bold">···</span>;
                            }
                            return null;
                        }).filter(Boolean)}
                    </div>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages || loading}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[#C9933A]/20 bg-white text-[#3F1F00] hover:border-[#C9933A] hover:bg-[#FDF6E3] disabled:opacity-30 disabled:hover:bg-white transition-all duration-300 shadow-sm"
                    >
                        <RiArrowRightSLine className="h-6 w-6" />
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   EXPORTS
───────────────────────────────────────────── */
export default function BrandPage({ params }) {
    return (
        <div className="min-h-screen bg-[#FDF6E3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 py-10 pb-20">
                {/* Breadcrumbs - Simple & Clean */}
                <div className="flex items-center gap-2 mb-8 font-sans text-[11px] font-bold uppercase tracking-widest text-[#C9933A]/60">
                    <button onClick={() => window.history.back()} className="hover:text-[#3F1F00] transition-colors">Home</button>
                    <span>/</span>
                    <span className="text-[#3F1F00]">Brands</span>
                    <span>/</span>
                    <span className="text-[#3F1F00]">{params.slug.replace(/-/g, ' ')}</span>
                </div>

                <ClientOnly fallback={
                    <div className="h-96 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-sans text-xs font-bold text-[#C9933A] uppercase tracking-[0.2em]">Preparing Collection</p>
                    </div>
                }>
                    <Suspense fallback={
                        <div className="h-96 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    }>
                        <BrandPageContent slug={params.slug} />
                    </Suspense>
                </ClientOnly>
            </div>
        </div>
    );
}
