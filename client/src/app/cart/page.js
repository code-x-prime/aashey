"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/imageUrl";



// Cart item component to optimize re-renders
const CartItem = React.memo(
    ({ item, onUpdateQuantity, onRemove, isLoading }) => {
        // Get product image - priority: variant images (by order) > product images (by order) > placeholder
        const getProductImage = () => {
            // Priority 1: Variant images (from server cart, sorted by order)
            if (
                item.variant?.images &&
                Array.isArray(item.variant.images) &&
                item.variant.images.length > 0
            ) {
                const sorted = [...item.variant.images].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                const primaryImage = sorted.find((img) => img.isPrimary) || sorted[0];
                const imageUrl = primaryImage?.url || sorted[0]?.url;
                if (imageUrl) return getImageUrl(imageUrl);
            }

            // Priority 2: Product images (by order) or product.image
            if (item.product?.images?.length > 0) {
                const sorted = [...item.product.images].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                const primaryImage = sorted.find((img) => img.isPrimary) || sorted[0];
                const imageUrl = primaryImage?.url || sorted[0]?.url;
                if (imageUrl) return getImageUrl(imageUrl);
            }
            if (item.product?.image) return getImageUrl(item.product.image);

            // Priority 3: Direct image property (from guest cart)
            if (item.image) return getImageUrl(item.image);

            return "/placeholder.jpg";
        };

        // Get variant display name - handle both guest cart and server cart structures
        const getVariantName = () => {
            // If variantName exists and is not empty, use it
            if (item.variantName && item.variantName.trim() !== "") {
                return item.variantName;
            }

            // Try to get attributes from variant object (server cart)
            if (item.variant?.attributes && item.variant.attributes.length > 0) {
                const attrStrings = item.variant.attributes.map(
                    (attr) => `${attr.attribute}: ${attr.value}`
                );
                return attrStrings.join(", ");
            }

            // Fallback to legacy color/size for backward compatibility
            let color = item.variant?.color?.name;
            let size = item.variant?.size?.name;
            if (!color) color = item.color?.name;
            if (!size) size = item.size?.name;

            if (color && size) {
                return `${color} • ${size}`;
            } else if (color) {
                return color;
            } else if (size) {
                return size;
            }

            // Return null if no variant info - don't show "Standard"
            return null;
        };

        const variantName = getVariantName();
        const productImage = getProductImage();
        const productName = item.productName || item.product?.name || "Product";
        const productSlug = item.productSlug || item.product?.slug || "#";

        return (
            <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-[#FDF6E3]/50 transition-colors duration-200">
                <div className="md:col-span-6 flex items-center">
                    <div className="relative h-24 w-24 md:h-28 md:w-28 bg-[#FDF6E3] rounded-xl overflow-hidden mr-4 flex-shrink-0 shadow-sm border border-[#C9933A]/15 group">
                        <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="112px"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/products/${productSlug}`}
                            className="font-playfair font-semibold text-[#3F1F00] hover:text-[#C9933A] transition-colors line-clamp-2"
                        >
                            {productName}
                        </Link>
                        {variantName && (
                            <div className="font-sans text-sm text-[#5C3A1E] mt-2 flex items-center gap-2">
                                {/* Show color swatch only if it's a color attribute (for backward compatibility) */}
                                {(item.variant?.color?.hexCode || item.color?.hexCode) && (
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-[#C9933A]/30 flex-shrink-0 shadow-sm"
                                        style={{
                                            backgroundColor:
                                                item.variant?.color?.hexCode || item.color?.hexCode,
                                        }}
                                    />
                                )}
                                <span className="truncate">{variantName}</span>
                            </div>
                        )}
                        {/* MOQ Display */}
                        {item.moq && item.moq > 1 && (
                            <div className="font-sans text-xs text-[#C9933A] mt-1 font-medium">
                                Min. Order: {item.moq} units
                            </div>
                        )}
                        {/* Pricing Slabs Info */}
                        {item.pricingSlabs && item.pricingSlabs.length > 0 && (
                            <div className="font-sans text-xs text-[#6B4423] mt-1">
                                Bulk pricing available
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between md:justify-center flex-col gap-1">
                    <span className="md:hidden font-sans font-medium text-[#5C3A1E]">Price:</span>
                    <div className="flex flex-col items-end md:items-center">
                        {/* Price Visibility Logic */}
                        {!isLoading && !item.isAuthenticated && item.hidePricesForGuests ? (
                            <span className="font-sans text-sm font-medium text-[#C9933A]">
                                Login to view
                            </span>
                        ) : (
                            <>
                                {item.originalPrice && parseFloat(item.originalPrice) > parseFloat(item.price) && (
                                    <span className="font-sans text-xs text-[#7A4E2D] line-through">
                                        {formatCurrency(item.originalPrice)}
                                    </span>
                                )}
                                <span className={`font-cormorant font-semibold italic text-lg ${item.priceSource === 'FLASH_SALE' ? 'text-orange-600' : 'text-[#3F1F00]'}`}>
                                    {formatCurrency(item.price)}
                                </span>
                                {item.priceSource === 'FLASH_SALE' && item.flashSale && (
                                    <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                        ⚡ {item.flashSale.discountPercentage}% OFF
                                    </span>
                                )}
                                {item.priceSource && item.priceSource !== "DEFAULT" && item.priceSource !== "FLASH_SALE" && (
                                    <span className="text-xs text-green-600 font-medium">
                                        Bulk pricing applied
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                    <span className="md:hidden font-sans font-medium text-[#5C3A1E]">Quantity:</span>
                    <div className="flex items-center border-2 border-[#C9933A]/25 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity, -1)}
                            className="px-3 py-2 hover:bg-[#C9933A] hover:text-[#3F1F00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            disabled={isLoading || item.quantity <= (item.moq || 1)}
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 min-w-[3rem] text-center font-cormorant font-bold text-lg bg-white border-x border-[#C9933A]/25">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin inline" />
                            ) : (
                                item.quantity
                            )}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity, 1)}
                            className="px-3 py-2 hover:bg-[#C9933A] hover:text-[#3F1F00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            disabled={isLoading}
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                    <div className="flex items-center md:block">
                        <span className="md:hidden mr-2 font-sans font-medium text-[#3F1F00]/60">
                            Subtotal:
                        </span>
                        <span className="font-cormorant font-bold text-[#3F1F00] text-xl italic">
                            {!isLoading && !item.isAuthenticated && item.hidePricesForGuests ? "-" : formatCurrency(item.subtotal)}
                        </span>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg ml-4 disabled:opacity-50 transition-all duration-200"
                        aria-label="Remove item"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Trash2 className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        );
    }
);
CartItem.displayName = "CartItem";

export default function CartPage() {
    const {
        cart,
        loading,
        cartItemsLoading,
        error,
        removeFromCart,
        updateCartItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        coupon,
        couponLoading,
        getCartTotals,
        isAuthenticated,
        mergeProgress,
        hidePricesForGuests,
    } = useCart();
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const router = useRouter();

    // Use useCallback to memoize handlers
    const handleQuantityChange = useCallback(
        async (cartItemId, currentQuantity, change) => {
            const newQuantity = currentQuantity + change;

            // Find the cart item to get MOQ
            const cartItem = cart.items.find(item => item.id === cartItemId);
            const effectiveMOQ = cartItem?.moq || 1;

            // Don't allow quantity below MOQ
            if (newQuantity < effectiveMOQ) {
                toast.error(`Minimum order quantity is ${effectiveMOQ} units`);
                return;
            }

            if (newQuantity < 1) return;

            try {
                await updateCartItem(cartItemId, newQuantity);
                // Toast notification for success
                // toast.success("Cart updated successfully");
            } catch (err) {
                console.error("Error updating quantity:", err);
                toast.error(err.message || "Failed to update quantity");
            }
        },
        [updateCartItem, cart.items]
    );

    const handleRemoveItem = useCallback(
        async (cartItemId) => {
            try {
                await removeFromCart(cartItemId);
                // toast.success("Item removed from cart");
            } catch (err) {
                console.error("Error removing item:", err);
                toast.error("Failed to remove item");
            }
        },
        [removeFromCart]
    );

    const handleClearCart = useCallback(async () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            try {
                await clearCart();
                toast.success("Cart has been cleared");
            } catch (err) {
                console.error("Error clearing cart:", err);
                toast.error("Failed to clear cart");
            }
        }
    }, [clearCart]);

    const handleApplyCoupon = useCallback(
        async (e) => {
            e.preventDefault();

            if (!couponCode.trim()) {
                setCouponError("Please enter a coupon code");
                return;
            }

            setCouponError("");

            try {
                await applyCoupon(couponCode);
                setCouponCode("");
            } catch (err) {
                setCouponError(err.message || "Invalid coupon code");
                toast.error(err.message || "Invalid coupon code");
            }
        },
        [couponCode, applyCoupon]
    );

    const handleRemoveCoupon = useCallback(() => {
        removeCoupon();
        setCouponCode("");
        setCouponError("");
        toast.success("Coupon removed");
    }, [removeCoupon]);

    // Memoize cart totals to prevent re-renders
    // getCartTotals only uses cart and coupon, which are already in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const totals = useMemo(() => getCartTotals(), [cart, coupon]);

    const handleCheckout = useCallback(() => {
        // If guest and prices hidden, force login
        if (!isAuthenticated && hidePricesForGuests) {
            router.push("/auth?redirect=checkout");
            return;
        }

        // Ensure minimum amount is 1
        const calculatedAmount = totals.subtotal - totals.discount;
        if (calculatedAmount < 1) {
            toast.info("Minimum order amount is ₹1");
            return;
        }

        if (!isAuthenticated) {
            router.push("/auth?redirect=checkout");
        } else {
            router.push("/checkout");
        }
    }, [isAuthenticated, router, totals, hidePricesForGuests]);

    // Display loading state
    if (loading && (!cart.items || cart.items.length === 0)) {
        return (
            <div className="container mx-auto px-4 py-8 bg-[#FDF6E3] min-h-screen">
                <div className="mb-8">
                    <h1 className="font-cormorant text-3xl md:text-4xl font-semibold text-[#3F1F00] mb-2">
                        Your Cart
                    </h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-[#C9933A] to-[#F0C96B]"></div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // Display empty cart - but not when there's an error
    if ((!cart.items || cart.items.length === 0) && !error) {
        return (
            <div className="container mx-auto px-4 py-12 bg-[#FDF6E3] min-h-screen">
                <div className="mb-8">
                    <h1 className="font-cormorant text-3xl md:text-4xl font-semibold text-[#3F1F00] mb-2">
                        Your Cart
                    </h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-[#C9933A] to-[#F0C96B]"></div>
                </div>
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md text-center border border-[#C9933A]/20 max-w-2xl mx-auto">
                    <div className="inline-flex justify-center items-center bg-[#C9933A]/10 p-6 rounded-2xl mb-6">
                        <ShoppingBag className="h-16 w-16 text-[#C9933A]" />
                    </div>
                    <h2 className="font-cormorant text-2xl font-semibold mb-3 text-[#3F1F00]">
                        Your cart is empty
                    </h2>
                    <p className="font-sans text-[#3F1F00]/70 mb-8 text-base">
                        Looks like you haven&apos;t added any ghee yet.
                    </p>
                    <Link href="/products">
                        <Button className="btn-gold text-base py-6 px-8 rounded-xl">
                            Shop Our Ghee
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-[#FDF6E3] min-h-screen">
            <div className="mb-8">
                <h1 className="font-cormorant text-3xl md:text-4xl font-semibold text-[#3F1F00] mb-2">
                    Your Cart
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-[#C9933A] to-[#F0C96B]"></div>
            </div>

            {/* Guest cart notice */}
            {!isAuthenticated && cart.items.length > 0 && (
                <div className="bg-[#C9933A]/10 border-l-4 border-[#C9933A] p-6 rounded-md flex items-start mb-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex-shrink-0 mr-4">
                        <div className="w-14 h-14 bg-[#C9933A] rounded-md flex items-center justify-center shadow-lg">
                            <svg
                                className="w-7 h-7 text-[#3F1F00]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-[#3F1F00] mb-2 flex items-center gap-2">
                            Guest Shopping Cart
                            <span className="text-xs font-normal bg-[#C9933A]/20 text-[#3F1F00] px-2 py-1 rounded-md">
                                Login Required
                            </span>
                        </h2>
                        <p className="font-sans text-[#3F1F00] mb-4 leading-relaxed">
                            You&apos;re currently shopping as a guest. To complete your
                            purchase and save your cart items for future visits, please log in
                            to your account.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/auth?redirect=cart">
                                <Button className="bg-[#C9933A] hover:bg-[#B8842F] text-[#3F1F00] font-semibold px-6 py-3 rounded-md shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                                    Log In to Continue
                                </Button>
                            </Link>
                            <Link href="/auth?redirect=cart">
                                <Button
                                    variant="outline"
                                    className="border-2 border-[#C9933A] hover:bg-[#C9933A] hover:text-[#3F1F00] text-[#3F1F00] font-semibold px-6 py-3 rounded-md transition-all duration-200"
                                >
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Show merge progress */}
            {mergeProgress && (
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-md flex items-start mb-6 shadow-sm">
                    <Loader2 className="text-primary mr-3 mt-0.5 flex-shrink-0 animate-spin" />
                    <div>
                        <h2 className="text-lg font-semibold text-primary">
                            Merging Cart
                        </h2>
                        <p className="text-primary/80">{mergeProgress}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#FDF6E3] min-h-screen p-4">

                {/* Cart Items Section */}
                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <h1 className="font-cormorant text-3xl md:text-4xl font-semibold text-[#3F1F00] mb-2">
                            Your Cart
                        </h1>
                        <div className="w-20 h-1 bg-gradient-to-r from-[#C9933A] to-[#F0C96B]"></div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-[#C9933A]/20 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b bg-gradient-to-r from-[#FDF6E3] to-[#FDF6E3]/80">
                            <div className="col-span-6 font-sc text-xs tracking-[0.15em] uppercase text-[#3F1F00]">
                                Product
                            </div>
                            <div className="col-span-2 font-sc text-xs tracking-[0.15em] uppercase text-[#3F1F00] text-center">
                                Price
                            </div>
                            <div className="col-span-2 font-sc text-xs tracking-[0.15em] uppercase text-[#3F1F00] text-center">
                                Quantity
                            </div>
                            <div className="col-span-2 font-sc text-xs tracking-[0.15em] uppercase text-[#3F1F00] text-center">
                                Subtotal
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="divide-y">
                            {cart.items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={{ ...item, isAuthenticated, hidePricesForGuests }}
                                    onUpdateQuantity={handleQuantityChange}
                                    onRemove={handleRemoveItem}
                                    isLoading={cartItemsLoading[item.id]}
                                />
                            ))}
                        </div>

                        {/* Cart Actions */}
                        <div className="p-4 md:p-5 border-t bg-gradient-to-r from-[#FDF6E3] to-[#FDF6E3]/80 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <Link href="/products">
                                <Button
                                    variant="outline"
                                    className="border-[#C9933A] text-[#3F1F00] hover:bg-[#C9933A] hover:text-[#3F1F00] transition-all duration-200 font-sans"
                                >
                                    ← Continue Shopping
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={handleClearCart}
                                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Clear Cart
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Cart Summary Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(63,31,0,0.08)] border border-[#C9933A]/15 p-5 md:p-6 sticky top-4 hover:shadow-lg transition-shadow duration-300">
                        <div className="mb-6">
                            <h2 className="font-cormorant text-xl font-semibold text-[#3F1F00] mb-2">
                                Cart Summary
                            </h2>
                            <div className="w-16 h-1 bg-[#C9933A]"></div>
                        </div>

                        {/* Apply Coupon - Hide if prices are hidden */}
                        {(!hidePricesForGuests || isAuthenticated) && (
                            <div className="mb-6 p-4 bg-gradient-to-br from-[#FDF6E3] to-[#F0C96B]/10 rounded-lg border border-[#C9933A]/20">
                                <h3 className="text-sm font-semibold mb-3 text-[#3F1F00] flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-[#C9933A]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                        />
                                    </svg>
                                    Have a coupon?
                                </h3>
                                {coupon ? (
                                    <div className="flex justify-between items-start bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-green-700 text-base">
                                                    {coupon.code}
                                                </span>
                                                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                                                    Applied
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-green-700 mb-1">
                                                {coupon.discountType === "PERCENTAGE"
                                                    ? `${coupon.discountValue}% off`
                                                    : `₹${coupon.discountValue} off`}
                                            </p>
                                            {coupon.applicableSubtotal && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Applies to {formatCurrency(coupon.applicableSubtotal)}{" "}
                                                    worth of{" "}
                                                    {coupon.matchedItems === 1
                                                        ? "eligible item"
                                                        : "eligible items"}
                                                    {cart.items?.length
                                                        ? ` (${coupon.matchedItems || 0} of ${cart.items.length
                                                        })`
                                                        : ""}
                                                </p>
                                            )}
                                            {((parseFloat(coupon.discountValue) > 90 &&
                                                coupon.discountType === "PERCENTAGE") ||
                                                coupon.isDiscountCapped) && (
                                                    <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
                                                        *Maximum discount capped at 90%
                                                    </p>
                                                )}
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors duration-200 ml-2"
                                            disabled={couponLoading}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) =>
                                                    setCouponCode(e.target.value.toUpperCase())
                                                }
                                                className={`flex-1 border-2 ${couponError
                                                    ? "border-red-300 focus-visible:ring-red-300"
                                                    : "border-gray-300 focus-visible:ring-primary"
                                                    }`}
                                            />
                                            <Button
                                                type="submit"
                                                disabled={couponLoading}
                                                className="bg-primary hover:bg-primary/90 text-white border-0"
                                            >
                                                {couponLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Apply"
                                                )}
                                            </Button>
                                        </form>
                                        <p className="text-xs text-[#6B4423] mt-2">
                                            *Maximum discount limited to 90% of cart value
                                        </p>
                                        {couponError && (
                                            <div className="mt-2 flex items-start gap-1.5 text-red-600 bg-red-50 p-2 rounded">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs">{couponError}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Price Details */}
                        <div className="border-t-2 border-[#C9933A]/30 pt-5">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-[#3F1F00]/80 font-medium">Subtotal</span>
                                    <span className="font-semibold text-[#3F1F00]">
                                        {!isAuthenticated && hidePricesForGuests ? (
                                            <Link href="/auth?redirect=cart" className="text-[#C9933A] hover:underline"> Login to view</Link>
                                        ) : (formatCurrency(totals.subtotal))}
                                    </span>
                                </div>

                                {coupon && (
                                    <div className="flex justify-between items-center bg-[#092D15]/10 px-3 py-2 rounded-md">
                                        <span className="text-[#092D15] font-medium">Discount</span>
                                        <span className="text-[#092D15] font-bold">
                                            -{formatCurrency(totals.discount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-1">
                                    <span className="text-[#3F1F00]/80 font-medium">Shipping</span>
                                    {totals.shipping > 0 ? (
                                        <span className="text-[#3F1F00] font-bold">
                                            {formatCurrency(totals.shipping)}
                                        </span>
                                    ) : (
                                        <span className="text-[#092D15] font-bold text-base flex items-center gap-1">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            FREE
                                        </span>
                                    )}
                                </div>

                                {/* Free shipping progress message */}
                                {totals.shipping > 0 && cart.freeShippingThreshold > 0 && (
                                    <div className="mt-2 text-sm text-[#C9933A] bg-[#C9933A]/10 p-3 rounded-md text-center font-medium border border-[#C9933A]/20 flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 text-[#C9933A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            Add <strong>{formatCurrency(cart.freeShippingThreshold - totals.subtotal)}</strong> more for <span className="text-[#092D15] font-bold">FREE shipping!</span>
                                        </span>
                                    </div>
                                )}

                            </div>

                            <div className="flex justify-between items-center font-bold text-xl mt-5 pt-5 border-t-2 border-[#C9933A]/30 bg-[#3F1F00] px-4 py-4 rounded-lg">
                                <span className="text-[#FDF6E3]">Total</span>
                                <span className="text-[#C9933A]">
                                    {!isAuthenticated && hidePricesForGuests ? (
                                        <Link href="/auth?redirect=cart" className="text-[#C9933A] hover:underline"> Login to view</Link>
                                    ) : (
                                        formatCurrency(totals.total)
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            className="w-full mt-6 bg-[#C9933A] hover:bg-[#F0C96B] text-[#3F1F00] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] font-semibold py-6 text-base rounded-xl"
                            size="lg"
                            onClick={handleCheckout}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {!isAuthenticated && hidePricesForGuests ? (
                                    <>Login to Checkout</>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-5 w-5" />
                                        Proceed to Checkout
                                        <span className="ml-2 font-bold">
                                            • {formatCurrency(totals.total)}
                                        </span>
                                    </>
                                )}
                            </span>
                        </Button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#5C3A1E]">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <p>Taxes and shipping calculated at checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
