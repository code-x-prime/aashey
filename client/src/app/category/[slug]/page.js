"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, Package } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductListCard } from "@/components/products/ProductCard";
import { getImageUrl } from "@/lib/imageUrl";

// Product Skeleton
function ProductCardSkeleton({ view }) {
    if (view === "list") {
        return (
            <div className="flex flex-row bg-white border border-[#C9933A]/15 rounded-lg overflow-hidden animate-pulse">
                <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-[#C9933A]/10" />
                <div className="flex-1 p-4 space-y-2">
                    <div className="h-3 bg-[#C9933A]/10 rounded w-1/4" />
                    <div className="h-4 bg-[#C9933A]/15 rounded w-3/4" />
                    <div className="h-3 bg-[#C9933A]/10 rounded w-1/2" />
                    <div className="h-5 bg-[#C9933A]/15 rounded w-1/3 mt-4" />
                </div>
            </div>
        );
    }
    return (
        <div className="bg-[#FDF6E3] rounded-lg overflow-hidden animate-pulse border border-[#C9933A]/15">
            <div className="aspect-[4/5] w-full bg-[#C9933A]/10" />
            <div className="p-4 space-y-2">
                <div className="h-3 bg-[#C9933A]/10 rounded w-3/4" />
                <div className="h-4 bg-[#C9933A]/15 rounded w-full" />
                <div className="h-5 bg-[#C9933A]/10 rounded w-1/3 mt-3" />
            </div>
        </div>
    );
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { slug } = params;

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

    // Read state FROM URL params (makes URLs shareable)
    const sortOption = searchParams.get("sort") || "newest";
    const viewMode = searchParams.get("view") || "grid";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    // Update URL param helper
    const setParam = useCallback((key, value, defaultValue) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === defaultValue) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        // Reset page when sort/view changes (not when changing page)
        if (key !== "page") params.delete("page");
        router.push(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const handleSortChange = (e) => setParam("sort", e.target.value, "newest");
    const handleViewChange = (mode) => setParam("view", mode, "grid");
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        const p = new URLSearchParams(searchParams.toString());
        if (newPage === 1) { p.delete("page"); } else { p.set("page", String(newPage)); }
        router.push(`?${p.toString()}`, { scroll: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            setLoading(true);
            try {
                let sort = "createdAt";
                let order = "desc";
                switch (sortOption) {
                    case "newest": sort = "createdAt"; order = "desc"; break;
                    case "oldest": sort = "createdAt"; order = "asc"; break;
                    case "price-asc": sort = "price"; order = "asc"; break;
                    case "price-desc": sort = "price"; order = "desc"; break;
                    case "name-asc": sort = "name"; order = "asc"; break;
                    case "name-desc": sort = "name"; order = "desc"; break;
                }

                const response = await fetchApi(
                    `/public/categories/${slug}/products?page=${currentPage}&limit=12&sort=${sort}&order=${order}`
                );

                setCategory(response.data.category);
                setProducts(response.data.products || []);
                setPagination(prev => response.data.pagination || prev);
            } catch (err) {
                console.error("Error fetching category:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchCategoryAndProducts();
    }, [slug, currentPage, sortOption]);

    // Loading state
    if (loading && !category) {
        return (
            <div className="min-h-screen bg-[#FDF6E3]">
                <div className="py-12 bg-[#FDF6E3]">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-[#C9933A]/15 rounded w-1/4" />
                            <div className="h-10 bg-[#C9933A]/15 rounded w-1/2" />
                            <div className="h-4 bg-[#C9933A]/10 rounded w-2/3" />
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} view="grid" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center px-4">
                <div className="bg-white border border-red-200 rounded-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <h2 className="font-cormorant text-xl font-semibold text-[#3F1F00] mb-2">Category Not Found</h2>
                    <p className="font-sans text-[#5C3A1E] mb-6">{error}</p>
                    <Link href="/categories" className="inline-flex items-center px-5 py-2.5 bg-[#3F1F00] text-[#FDF6E3] rounded-lg font-sans font-semibold hover:bg-[#C9933A] transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Categories
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDF6E3]">
            {/* Hero */}
            <section className="relative py-10 md:py-14 bg-gradient-to-br from-[#3F1F00] via-[#5C2E00] to-[#2A6041] overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 right-20 w-60 h-60 bg-[#C9933A]/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center font-sans text-sm mb-5 flex-wrap gap-1">
                        <Link href="/" className="text-white/60 hover:text-[#C9933A] transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-white/30 mx-1" />
                        <Link href="/categories" className="text-white/60 hover:text-[#C9933A] transition-colors">Categories</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-white/30 mx-1" />
                        <span className="text-[#C9933A] font-medium">{category?.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                        {category?.image && (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white/10 border border-white/20 overflow-hidden flex-shrink-0">
                                <Image src={getImageUrl(category.image)} alt={category.name} width={96} height={96} className="w-full h-full object-contain p-3" />
                            </div>
                        )}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9933A]/20 border border-[#C9933A]/30 rounded-full font-sc text-xs tracking-[0.1em] uppercase text-[#C9933A] font-medium mb-2">
                                <Package className="w-3.5 h-3.5" />
                                {pagination.total} Products
                            </div>
                            <h1 className="font-cormorant text-2xl md:text-4xl font-semibold text-white mb-1">{category?.name}</h1>
                            {category?.description && <p className="font-sans text-white/70 max-w-2xl text-sm">{category.description}</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-white rounded-lg p-3 border border-[#C9933A]/15 shadow-sm">
                    <div className="font-sans text-[#6B4423] text-sm">
                        Showing <span className="text-[#3F1F00] font-semibold">{products.length}</span> of <span className="text-[#3F1F00] font-semibold">{pagination.total}</span> products
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center bg-[#FDF6E3] rounded-md p-0.5 border border-[#C9933A]/15">
                            <button
                                onClick={() => handleViewChange("grid")}
                                title="Grid view"
                                className={`p-1.5 rounded transition-all duration-200 ${viewMode === "grid" ? "bg-[#3F1F00] text-[#FDF6E3] shadow-sm" : "text-[#7A4E2D] hover:text-[#3F1F00]"}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleViewChange("list")}
                                title="List view"
                                className={`p-1.5 rounded transition-all duration-200 ${viewMode === "list" ? "bg-[#3F1F00] text-[#FDF6E3] shadow-sm" : "text-[#7A4E2D] hover:text-[#3F1F00]"}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={handleSortChange}
                                className="appearance-none bg-white border border-[#C9933A]/20 text-[#3F1F00] rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#C9933A]/30 focus:border-[#C9933A] font-sans text-sm font-medium cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A4E2D] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Products Grid / List */}
                {loading ? (
                    <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                        {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} view={viewMode} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-[#C9933A]/10 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-[#C9933A]" />
                        </div>
                        <h2 className="font-cormorant text-xl font-semibold text-[#3F1F00] mb-2">No Products Found</h2>
                        <p className="font-sans text-[#5C3A1E] mb-6">This category doesn&apos;t have any products yet.</p>
                        <Link href="/products" className="inline-flex items-center px-6 py-3 bg-[#3F1F00] text-[#FDF6E3] rounded-lg font-sans font-semibold hover:bg-[#C9933A] transition-colors">
                            Browse All Products
                        </Link>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {products.map((product) => <ProductListCard key={product.id} product={product} />)}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center mt-10 gap-1.5">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2.5 bg-white border border-[#C9933A]/20 rounded-lg text-[#6B4423] hover:text-[#3F1F00] hover:border-[#C9933A]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {[...Array(pagination.pages)].map((_, i) => {
                            const page = i + 1;
                            const show = page === 1 || page === pagination.pages || (page >= currentPage - 1 && page <= currentPage + 1);
                            const ellipsis = (page === 2 && currentPage > 3) || (page === pagination.pages - 1 && currentPage < pagination.pages - 2);
                            if (ellipsis) return <span key={page} className="text-[#7A4E2D] px-1">…</span>;
                            if (!show) return null;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-lg font-cormorant font-semibold text-sm transition-colors ${currentPage === page ? "bg-[#3F1F00] text-[#FDF6E3]" : "bg-white border border-[#C9933A]/20 text-[#3F1F00] hover:border-[#C9933A]/40"}`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.pages}
                            className="p-2.5 bg-white border border-[#C9933A]/20 rounded-lg text-[#6B4423] hover:text-[#3F1F00] hover:border-[#C9933A]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
