"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/imageUrl";
import { Clock, Zap, ChevronRight, Loader2, Flame, Timer, ShoppingBag } from "lucide-react";

// Helper function to format image URLs


// Premium Countdown Timer Component
const CountdownTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endTime).getTime() - new Date().getTime();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const TimeBlock = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className="bg-[#FDF6E3]/10 rounded-2xl px-4 py-3 min-w-[60px]">
                <span className="font-cormorant text-4xl md:text-5xl font-bold text-[#C9933A] block text-center">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="font-sc text-xs text-[#FDF6E3]/80 tracking-widest mt-1.5 uppercase">{label}</span>
        </div>
    );

    return (
        <div className="flex items-center gap-2 md:gap-3">
            {timeLeft.days > 0 && (
                <>
                    <TimeBlock value={timeLeft.days} label="Days" />
                    <span className="font-cormorant text-3xl font-bold text-[#C9933A]">:</span>
                </>
            )}
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <span className="font-cormorant text-3xl font-bold text-[#C9933A]">:</span>
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            <span className="font-cormorant text-3xl font-bold text-[#C9933A]">:</span>
            <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>
    );
};

// Flash Sale Product Card - Premium Design
const FlashSaleProductCard = ({ product, discountPercentage }) => {
    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="product-card relative">
                {/* SALE Badge */}
                <span className="absolute top-3 left-3 badge-gold z-10">
                    SALE
                </span>

                {/* Discount Ribbon */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg">
                        <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 animate-pulse" />
                            <span className="font-sans text-xs font-bold">{discountPercentage}% OFF</span>
                        </div>
                    </div>
                </div>

                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-[#FDF6E3]">
                    <Image
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A00]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="btn-gold text-xs px-4 py-2">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            View Deal
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="product-card-body">
                    <h3 className="product-card-name line-clamp-2 text-sm min-h-[2.5em] group-hover:text-[#C9933A] transition-colors">
                        {product.name}
                    </h3>

                    {/* Prices */}
                    <div className="flex items-end gap-2 flex-wrap">
                        <span className="product-card-price text-xl">
                            {formatCurrency(product.salePrice)}
                        </span>
                        <span className="product-price-old text-xs">
                            {formatCurrency(product.priceBeforeFlashSale || product.originalPrice)}
                        </span>
                    </div>

                    {/* Savings Badge */}
                    <div className="mt-2 inline-flex items-center gap-1 bg-[#092D15]/10 text-[#092D15] px-2 py-1 rounded-full font-sans text-xs font-medium">
                        <span>You Save</span>
                        <span className="font-bold">
                            {formatCurrency((product.priceBeforeFlashSale || product.originalPrice) - product.salePrice)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export function FlashSaleSection() {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                setLoading(true);
                const response = await fetchApi("/public/flash-sales");
                if (response.success && response.data.flashSales?.length > 0) {
                    setFlashSales(response.data.flashSales);
                }
            } catch (err) {
                console.error("Error fetching flash sales:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashSales();
    }, []);

    // Don't render if no active flash sales
    if (loading) {
        return (
            <section className="py-20 bg-[#3F1F00]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-10 h-10 text-[#C9933A] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (!flashSales.length || error) {
        return null;
    }

    const currentSale = flashSales[0];

    return (
        <section className="py-10 md:py-16 bg-[#3F1F00] relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#C9933A]/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[#C9933A]/15 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16">
                    {/* Eyebrow */}
                    <span className="section-eyebrow">Limited Time</span>

                    {/* Title */}
                    <h2 className="font-cormorant text-5xl md:text-6xl font-semibold text-[#FDF6E3] mt-3 mb-2">
                        ⚡ Flash Sale
                    </h2>
                    <p className="font-sans text-[#FDF6E3]/70 mb-8 text-base">{currentSale.name}</p>

                    {/* Timer Section */}
                    <div className="inline-flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-[#FDF6E3]">
                            <Timer className="w-4 h-4 text-[#C9933A]" />
                            <span className="font-sc text-xs tracking-widest uppercase text-[#FDF6E3]/70">Hurry! Offer ends in</span>
                        </div>
                        <CountdownTimer endTime={currentSale.endTime} />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
                    {currentSale.products.slice(0, 10).map((product) => (
                        <FlashSaleProductCard
                            key={product.id}
                            product={product}
                            discountPercentage={currentSale.discountPercentage}
                        />
                    ))}
                </div>

                {/* View All Button */}
                {currentSale.products.length > 5 && (
                    <div className="text-center mt-12">
                        <Link
                            href="/products?flashSale=true"
                            className="btn-gold text-base gap-3 inline-flex"
                        >
                            <Flame className="w-5 h-5" />
                            View All Flash Deals
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

export default FlashSaleSection;
