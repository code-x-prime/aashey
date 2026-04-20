"use client";

import Link from "next/link";
import { Heart, Loader2, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/imageUrl";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (regularPrice, salePrice) => {
  if (!regularPrice || !salePrice || regularPrice <= salePrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

// ── Shared price + wishlist logic hook ──────────────────────────────────────
function useProductCard(product) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState({});
  const [isAddingToWishlist, setIsAddingToWishlist] = useState({});
  const [priceVisibilitySettings, setPriceVisibilitySettings] = useState(null);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!isAuthenticated || typeof window === "undefined") return;
      try {
        const response = await fetchApi("/users/wishlist", { credentials: "include" });
        const items = response.data?.wishlistItems?.reduce((acc, item) => {
          acc[item.productId] = true;
          return acc;
        }, {}) || {};
        setWishlistItems(items);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchWishlistStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchPriceVisibilitySettings = async () => {
      try {
        const response = await fetchApi("/public/price-visibility-settings");
        if (response.success) {
          setPriceVisibilitySettings(response.data);
        }
      } catch (error) {
        setPriceVisibilitySettings({ hidePricesForGuests: false });
      }
    };
    fetchPriceVisibilitySettings();
  }, []);

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${product.slug}`);
      return;
    }
    setIsAddingToWishlist((prev) => ({ ...prev, [product.id]: true }));
    try {
      if (wishlistItems[product.id]) {
        const wishlistResponse = await fetchApi("/users/wishlist", { credentials: "include" });
        const wishlistItem = wishlistResponse.data?.wishlistItems?.find((item) => item.productId === product.id);
        if (wishlistItem) {
          await fetchApi(`/users/wishlist/${wishlistItem.id}`, { method: "DELETE", credentials: "include" });
          setWishlistItems((prev) => { const s = { ...prev }; delete s[product.id]; return s; });
        }
      } else {
        await fetchApi("/users/wishlist", { method: "POST", credentials: "include", body: JSON.stringify({ productId: product.id }) });
        setWishlistItems((prev) => ({ ...prev, [product.id]: true }));
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setIsAddingToWishlist((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Price calculation
  const parsePrice = (value) => {
    if (value === null || value === undefined) return null;
    if (value === 0) return 0;
    const parsed = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(parsed) ? null : parsed;
  };

  const basePriceField = parsePrice(product.basePrice);
  const regularPriceField = parsePrice(product.regularPrice);
  const priceField = parsePrice(product.price);
  const salePriceField = parsePrice(product.salePrice);

  const hasFlashSale = product.flashSale?.isActive === true;
  const flashSalePrice = hasFlashSale ? parsePrice(product.flashSale.flashSalePrice) : null;
  const flashSaleDiscountPercent = hasFlashSale ? product.flashSale.discountPercentage : 0;

  let hasSale = product.hasSale !== undefined && product.hasSale !== null ? Boolean(product.hasSale)
    : (salePriceField !== null && salePriceField > 0 && ((regularPriceField && salePriceField < regularPriceField) || (priceField && salePriceField < priceField)));

  let originalPrice = null;
  let currentPrice = 0;
  if (basePriceField !== null && regularPriceField !== null) {
    currentPrice = basePriceField;
    if (hasSale && basePriceField < regularPriceField) originalPrice = regularPriceField;
  } else if (salePriceField !== null) {
    if (hasSale && salePriceField) {
      currentPrice = salePriceField;
      originalPrice = priceField || basePriceField || regularPriceField || null;
    } else {
      currentPrice = priceField || basePriceField || regularPriceField || 0;
    }
  } else {
    currentPrice = basePriceField || regularPriceField || priceField || 0;
  }

  if (!currentPrice || isNaN(currentPrice)) currentPrice = 0;

  let displayPrice = currentPrice;
  let showFlashSaleBadge = false;
  if (hasFlashSale && flashSalePrice !== null) {
    if (!originalPrice) originalPrice = currentPrice;
    displayPrice = flashSalePrice;
    showFlashSaleBadge = true;
  }

  const discountPercent = showFlashSaleBadge
    ? flashSaleDiscountPercent
    : (hasSale && originalPrice && currentPrice ? calculateDiscountPercentage(originalPrice, currentPrice) : 0);

  const showPrice = !priceVisibilitySettings?.hidePricesForGuests || isAuthenticated;

  return {
    wishlistItems, isAddingToWishlist, handleAddToWishlist,
    displayPrice, originalPrice, hasSale, showFlashSaleBadge, discountPercent, showPrice,
  };
}

// ── Grid Card ────────────────────────────────────────────────────────────────
export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const {
    wishlistItems, isAddingToWishlist, handleAddToWishlist,
    displayPrice, originalPrice, hasSale, showFlashSaleBadge, discountPercent, showPrice,
  } = useProductCard(product);

  const getAllProductImages = useMemo(() => {
    const images = [];
    const seen = new Set();
    const add = (url) => {
      const u = getImageUrl(url);
      if (!seen.has(u)) { seen.add(u); images.push(u); }
    };
    // Variant images (sorted by order)
    product.variants?.forEach((v) => {
      const imgs = [...(v.images || [])].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      imgs.forEach((img) => add(img?.url || img));
    });
    // Product images (sorted by order)
    const productImgs = [...(product.images || [])].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    productImgs.forEach((img) => add(img?.url || img));
    if (!images.length && product.image) add(product.image);
    if (!images.length) images.push("/placeholder.jpg");
    return images;
  }, [product]);

  useEffect(() => {
    if (!isHovered || getAllProductImages.length <= 1) { setCurrentImageIndex(0); return; }
    const interval = setInterval(() => setCurrentImageIndex((p) => (p + 1) % getAllProductImages.length), 1200);
    return () => clearInterval(interval);
  }, [isHovered, getAllProductImages.length]);

  return (
    <div
      className="group relative bg-[#FDF6E3] rounded-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-[#C9933A]/15 border border-[#C9933A]/20 hover:border-[#C9933A]/50 h-full flex flex-col hover:-translate-y-1 duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-[#FDF6E3]">
        {/* Wishlist */}
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist[product.id]}
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-[#FDF6E3]/95 backdrop-blur-sm shadow-md hover:bg-[#FDF6E3] text-[#7A4E2D] hover:text-red-500 transition-all duration-200 hover:scale-110"
        >
          {isAddingToWishlist[product.id] ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${wishlistItems[product.id] ? "fill-red-500 text-red-500" : ""}`} />}
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {product.category && (
            <span className="px-2.5 py-1 bg-[#FDF6E3]/95 backdrop-blur-sm text-xs font-bold text-[#3F1F00] rounded-md shadow-sm border border-[#C9933A]/30 uppercase tracking-wide w-fit font-display">
              {typeof product.category === "object" ? product.category.name : product.category}
            </span>
          )}
          {showFlashSaleBadge && discountPercent > 0 && (
            <div className="px-2.5 py-1 bg-gradient-to-r from-[#C9933A] to-[#3F1F00] text-white text-xs font-bold rounded-md shadow-md w-fit animate-pulse">
              🔥 {discountPercent}% OFF
            </div>
          )}
          {!showFlashSaleBadge && hasSale && discountPercent > 0 && (
            <div className="px-2.5 py-1 bg-[#3F1F00] text-[#FDF6E3] text-xs font-bold rounded-md shadow-sm w-fit">{discountPercent}% OFF</div>
          )}
        </div>

        {/* Image */}
        <div className="relative w-full h-full">
          <Image
            src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>

        {/* Dots */}
        {getAllProductImages.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
            {getAllProductImages.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-5 bg-[#C9933A]" : "w-1.5 bg-[#FDF6E3]/60"}`} />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-[#3F1F00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>

      {/* Details */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-[#3F1F00] text-base mb-1.5 line-clamp-2 group-hover:text-[#C9933A] transition-colors leading-snug " title={product.name}>
            {product.name}
          </h3>
        </Link>
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-[#C9933A] fill-[#C9933A]" />
            <span className="text-xs font-semibold text-[#3F1F00]">{product.avgRating}</span>
          </div>
        )}
        <div className="mt-auto pt-2.5 border-t border-[#C9933A]/15">
          {showPrice ? (
            <div className="flex items-baseline gap-2.5">
              <span className={`text-lg font-bold  ${showFlashSaleBadge ? "text-[#C9933A]" : "text-[#3F1F00]"}`}>{formatCurrency(displayPrice)}</span>
              {(hasSale || showFlashSaleBadge) && originalPrice && (
                <span className="text-sm text-[#7A4E2D] line-through ">{formatCurrency(originalPrice)}</span>
              )}
            </div>
          ) : (
            <Link href="/auth?redirect=products" className="text-sm font-semibold text-[#C9933A] hover:underline ">Login to view price</Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ── List Card ────────────────────────────────────────────────────────────────
export const ProductListCard = ({ product }) => {
  const {
    wishlistItems, isAddingToWishlist, handleAddToWishlist,
    displayPrice, originalPrice, hasSale, showFlashSaleBadge, discountPercent, showPrice,
  } = useProductCard(product);

  const imageUrl = useMemo(() => {
    const img = product.variants?.[0]?.images?.[0] || product.images?.[0] || product.image;
    return img ? getImageUrl(img?.url || img) : "/placeholder.jpg";
  }, [product]);

  return (
    <div className="group flex flex-row bg-white border border-[#C9933A]/15 rounded-lg overflow-hidden hover:border-[#C9933A]/40 hover:shadow-md transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-[#FDF6E3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="144px"
        />
        {showFlashSaleBadge && discountPercent > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#C9933A] text-white text-xs font-bold rounded">🔥 {discountPercent}%</div>
        )}
        {!showFlashSaleBadge && hasSale && discountPercent > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#3F1F00] text-[#FDF6E3] text-xs font-bold rounded">{discountPercent}% OFF</div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0">
        {/* Category */}
        {product.category && (
          <span className="font-sc text-[10px] tracking-[0.1em] uppercase text-[#C9933A]/70 mb-1">
            {typeof product.category === "object" ? product.category.name : product.category}
          </span>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className=" font-bold text-[#3F1F00] text-lg leading-snug mb-1.5 group-hover:text-[#C9933A] transition-colors line-clamp-2" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(product.avgRating) ? "text-[#C9933A] fill-[#C9933A]" : "text-[#C9933A]/20"}`} />
            ))}
            <span className="text-xs text-[#6B4423] ml-0.5">{product.avgRating}</span>
          </div>
        )}

        {/* Short description if available */}
        {product.shortDescription && (
          <p className=" text-xs text-[#6B4423] line-clamp-2 mb-2 hidden sm:block">{product.shortDescription}</p>
        )}

        {/* Price + Wishlist */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#C9933A]/10">
          <div>
            {showPrice ? (
              <div className="flex items-baseline gap-2.5">
                <span className={`text-xl font-bold  ${showFlashSaleBadge ? "text-[#C9933A]" : "text-[#3F1F00]"}`}>{formatCurrency(displayPrice)}</span>
                {(hasSale || showFlashSaleBadge) && originalPrice && (
                  <span className="text-sm text-[#7A4E2D] line-through ">{formatCurrency(originalPrice)}</span>
                )}
              </div>
            ) : (
              <Link href="/auth?redirect=products" className="text-sm font-semibold text-[#C9933A] hover:underline ">Login to view price</Link>
            )}
          </div>
          <button
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist[product.id]}
            className="p-1.5 rounded-md text-[#8B6040] hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            {isAddingToWishlist[product.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${wishlistItems[product.id] ? "fill-red-500 text-red-500" : ""}`} />}
          </button>
        </div>
      </div>
    </div>
  );
};
