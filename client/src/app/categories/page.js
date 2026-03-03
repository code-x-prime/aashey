"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { AlertCircle, ArrowRight, Grid3X3, Package, Zap, Headphones } from "lucide-react";
import { getCategoryImageUrl } from "@/lib/imageUrl";



const CategoryCard = ({ category, index }) => {
    const hasSubs = category.subCategories?.length > 0;
    return (
        <div className="group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="card-premium h-full hover:border-[#C9933A]/40 flex flex-col">
                <Link href={`/category/${category.slug}`} className="flex-shrink-0">
                    <div className="relative h-40 w-full overflow-hidden bg-[#FDF6E3] rounded-t-md">
                        <Image
                            src={getCategoryImageUrl(category.image)}
                            alt={category.name}
                            fill
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 bg-[#C9933A] text-[#3F1F00] px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                            {category._count?.products || 0}
                        </div>
                    </div>
                    <div className="p-4 border-t border-[#C9933A]/20">
                        <h3 className="text-sm font-bold text-[#3F1F00] mb-1 group-hover:text-[#C9933A] transition-colors">
                            {category.name}
                        </h3>
                        <p className="text-[#5C3A1E] text-xs mb-3 line-clamp-2">
                            {category.description || "Explore our products"}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6B4423]">
                                {category._count?.products || 0} products
                            </span>
                            <span className="flex items-center text-[#C9933A] font-medium text-xs gap-1 group-hover:gap-2 transition-all">
                                View <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>
                </Link>
                {hasSubs && (
                    <div className="p-3 pt-0 mt-auto border-t border-[#C9933A]/10">
                        <p className="text-[10px] font-semibold text-[#3F1F00]/70 uppercase tracking-wide mb-2">Subcategories</p>
                        <ul className="space-y-1.5">
                            {category.subCategories.map((sub) => (
                                <li key={sub.id}>
                                    <Link href={`/products?category=${encodeURIComponent(category.slug)}&subcategory=${encodeURIComponent(sub.slug)}`} className="flex items-start gap-1.5 text-xs text-[#1A0A00] hover:text-[#C9933A]">
                                        <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">{sub.name}</span>
                                        {sub.description && <span className="text-[10px] text-[#6B4423] line-clamp-1"> — {sub.description}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const CategoryCardSkeleton = () => (
    <div className="bg-[#FDF6E3] rounded-md overflow-hidden animate-pulse border border-[#C9933A]/15">
        <div className="h-40 w-full bg-[#FDF6E3]"></div>
        <div className="p-4 border-t border-[#C9933A]/20">
            <div className="h-4 bg-[#C9933A]/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-[#FDF6E3] rounded w-full mb-1"></div>
            <div className="h-3 bg-[#FDF6E3] rounded w-5/6 mb-3"></div>
            <div className="flex justify-between">
                <div className="h-3 bg-[#FDF6E3] rounded w-1/4"></div>
                <div className="h-3 bg-[#C9933A]/20 rounded w-1/4"></div>
            </div>
        </div>
    </div>
);

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await fetchApi("/public/categories");
                setCategories(response.data.categories || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(err.message || "Failed to load categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const totalProducts = categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0);

    return (
        <div className="min-h-screen bg-[#FDF6E3]">
            {/* Hero */}
            <section className="py-12 md:py-16 bg-gradient-section">
                <div className="section-container text-center">
                    <span className="section-badge mb-4">
                        <Grid3X3 className="w-4 h-4" />
                        Browse Categories
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-cormorant font-bold text-[#3F1F00] mb-4">
                        Shop by <span className="text-[#C9933A]">Category</span>
                    </h1>
                    <p className="text-[#3F1F00] max-w-xl mx-auto">
                        Explore our wide range of authentic Indian namkeen and snacks
                    </p>
                </div>
            </section>

            {/* Breadcrumb */}
            <div className="section-container py-4">
                <div className="flex items-center text-sm">
                    <Link href="/" className="text-[#5C3A1E] hover:text-[#C9933A] transition-colors">Home</Link>
                    <span className="mx-2 text-[#7A4E2D]">/</span>
                    <span className="text-[#C9933A] font-medium">Categories</span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="section-container mb-6">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-start">
                        <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0 w-5 h-5" />
                        <div>
                            <h3 className="font-medium text-red-800 mb-1">Error Loading Categories</h3>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="section-container pb-16">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {[...Array(3)].map((_, index) => (
                            <CategoryCardSkeleton key={index} />
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-[#C9933A]/15 rounded-md flex items-center justify-center">
                            <Package className="w-8 h-8 text-[#C9933A]" />
                        </div>
                        <h2 className="text-xl font-bold text-[#3F1F00] mb-2">No Categories Found</h2>
                        <p className="text-[#5C3A1E] mb-6 max-w-md mx-auto">
                            We&apos;re adding new categories soon. Check back later!
                        </p>
                        <Link href="/products">
                            <button className="px-6 py-3 bg-[#C9933A] text-[#3F1F00] rounded-md font-semibold hover:bg-[#B8842F] transition-colors shadow-md">
                                Browse All Products
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Categories Grid: 3 columns on desktop (Namkeen, Snacks, Sweets) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {categories.map((category, index) => (
                                <CategoryCard key={category.id} category={category} index={index} />
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-12 bg-[#3F1F00] rounded-md p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                <div>
                                    <div className="w-10 h-10 bg-[#C9933A]/20 rounded-md flex items-center justify-center mx-auto mb-2 text-[#C9933A]">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-[#FDF6E3]">{categories.length}</div>
                                    <div className="text-sm text-[#FDF6E3]/80">Categories</div>
                                </div>
                                <div>
                                    <div className="w-10 h-10 bg-[#C9933A]/20 rounded-md flex items-center justify-center mx-auto mb-2 text-[#C9933A]">
                                        <Grid3X3 className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-[#FDF6E3]">{totalProducts}</div>
                                    <div className="text-sm text-[#FDF6E3]/80">Products</div>
                                </div>
                                <div>
                                    <div className="w-10 h-10 bg-[#C9933A]/20 rounded-md flex items-center justify-center mx-auto mb-2 text-[#C9933A]">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-[#FDF6E3]">100%</div>
                                    <div className="text-sm text-[#FDF6E3]/80">Pure</div>
                                </div>
                                <div>
                                    <div className="w-10 h-10 bg-[#C9933A]/20 rounded-md flex items-center justify-center mx-auto mb-2 text-[#C9933A]">
                                        <Headphones className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-[#FDF6E3]">24/7</div>
                                    <div className="text-sm text-[#FDF6E3]/80">Support</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
