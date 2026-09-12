"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Plus, Check, Loader2 } from "lucide-react";
import { fetchProductsByType, formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/imageUrl";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

const SUGGESTION_LIMIT = 6;

// Pick the variant a one-tap "Add" should use: first active + in-stock one,
// falling back to the first variant if none are marked active/in-stock.
function pickDefaultVariant(product) {
  const variants = product?.variants || [];
  if (!variants.length) return null;
  const inStock = variants.find(
    (v) => v.isActive !== false && (v.stock ?? v.quantity ?? 1) > 0
  );
  return inStock || variants[0];
}

function getProductPrice(product, variant) {
  const sale = parseFloat(variant?.salePrice ?? product?.salePrice);
  const regular = parseFloat(variant?.price ?? product?.price);
  if (!isNaN(sale) && sale > 0 && (isNaN(regular) || sale < regular)) {
    return { price: sale, original: !isNaN(regular) ? regular : null };
  }
  return { price: !isNaN(regular) ? regular : (sale || 0), original: null };
}

function getProductImage(product) {
  const fromVariant = product?.variants?.find((v) => v.images?.length)?.images?.[0];
  const fromProduct = product?.images?.[0];
  const img = fromVariant || fromProduct || product?.image;
  const url = img?.url || img;
  return url ? getImageUrl(url) : "/placeholder.jpg";
}

// One compact suggestion tile: tap the image/name to view the product,
// tap "Add" to add the default variant to the cart right where you are —
// no page navigation, so it works well inline on cart/checkout.
function SuggestionCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => pickDefaultVariant(product), [product]);
  const { price, original } = useMemo(() => getProductPrice(product, variant), [product, variant]);
  const image = useMemo(() => getProductImage(product), [product]);
  const outOfStock = variant && (variant.stock ?? variant.quantity ?? 0) <= 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || adding || outOfStock) return;
    setAdding(true);
    try {
      await addToCart(variant.id, variant.moq || 1);
      setAdded(true);
      toast.success(`${product.name} added to cart`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      // useCart already toasts the error
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="relative w-[128px] sm:w-40 md:w-44 flex-shrink-0 snap-start bg-white rounded-xl border border-[#C9933A]/20 overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[#FDF6E3]">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 128px, 176px"
          />
        </div>
        <div className="p-2 sm:p-2.5">
          <p className="text-[11px] sm:text-xs font-semibold text-[#3F1F00] line-clamp-2 leading-snug min-h-[2.4em]">
            {product.name}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[12px] sm:text-sm font-bold text-[#3F1F00]">
              {formatCurrency(price)}
            </span>
            {original && (
              <span className="text-[10px] text-[#7A4E2D] line-through">
                {formatCurrency(original)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* One-tap add — large enough touch target for mobile, doesn't navigate */}
      <button
        onClick={handleAdd}
        disabled={adding || outOfStock || !variant}
        className={`absolute bottom-2 right-2 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shadow-md transition-all ${
          added
            ? "bg-green-500 text-white"
            : "bg-[#3F1F00] text-[#FDF6E3] hover:bg-[#5C2E00]"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label={`Add ${product.name} to cart`}
      >
        {adding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : added ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/**
 * "You may also like" strip — shown on the cart and checkout pages to
 * suggest a handful of popular products the customer isn't already buying.
 * Tapping the "+" adds the item to the cart instantly, in place — no
 * navigation away from cart/checkout. Pulls bestsellers first, falls back
 * to featured/trending, and hides itself quietly if nothing is available.
 */
export default function CartSuggestions({ cartItems = [], title = "You may also like" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const excludedProductIds = new Set(
      (cartItems || [])
        .map((item) => item.productId || item.product?.id)
        .filter(Boolean)
    );

    const load = async () => {
      setLoading(true);
      try {
        // Try bestsellers first, then featured/trending, as sources of "good" suggestions
        let pool = [];
        for (const type of ["bestseller", "featured", "trending"]) {
          if (pool.length >= SUGGESTION_LIMIT) break;
          try {
            const res = await fetchProductsByType(type, SUGGESTION_LIMIT + excludedProductIds.size);
            const items = res?.data?.products || [];
            for (const p of items) {
              if (pool.length >= SUGGESTION_LIMIT + excludedProductIds.size) break;
              if (!pool.some((existing) => existing.id === p.id)) pool.push(p);
            }
          } catch {
            // skip this type, try the next
          }
        }

        const filtered = pool
          .filter((p) => !excludedProductIds.has(p.id))
          .slice(0, SUGGESTION_LIMIT);

        if (!cancelled) setProducts(filtered);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((cartItems || []).map((i) => i.productId || i.product?.id))]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex items-center gap-2 mb-4 sm:mb-5 px-0.5">
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#C9933A] flex-shrink-0" />
        <h2 className="font-sans text-base sm:text-xl md:text-2xl font-semibold text-[#3F1F00] leading-tight">
          {title}
        </h2>
      </div>

      {loading ? (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[128px] sm:w-40 md:w-44 flex-shrink-0">
              <div className="aspect-square rounded-xl bg-[#C9933A]/10 animate-pulse" />
              <div className="h-3 mt-2 rounded bg-[#C9933A]/10 animate-pulse" />
              <div className="h-3 mt-1.5 w-2/3 rounded bg-[#C9933A]/10 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch]">
          {products.map((product) => (
            <SuggestionCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
