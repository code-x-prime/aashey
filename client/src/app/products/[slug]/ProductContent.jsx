"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import ReviewSection from "./ReviewSection";
import { useAddVariantToCart } from "@/lib/cart-utils";
import { ProductCard } from "@/components/products/ProductCard";
import { getImageUrl } from "@/lib/imageUrl";

import {
  RiStarFill,
  RiStarLine,
  RiAlertLine,
  RiShoppingCartLine,
  RiHeartLine,
  RiHeartFill,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiTruckLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiLeafLine,
  RiFlashlightLine,
  RiBox3Line,
  RiLoader4Line,
  RiInformationLine,
} from "react-icons/ri";

export default function ProductContent({ slug }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [effectivePriceInfo, setEffectivePriceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [availableCombinations, setAvailableCombinations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [priceVisibilitySettings, setPriceVisibilitySettings] = useState(null);

  const { addVariantToCart } = useAddVariantToCart();

  /* ── Pricing helpers ─────────────────────────── */
  const getEffectivePrice = (variant, qty) => {
    if (!variant) return null;
    const basePrice = variant.price ? (typeof variant.price === "string" ? parseFloat(variant.price) : variant.price) : 0;
    const baseSalePrice = variant.salePrice ? (typeof variant.salePrice === "string" ? parseFloat(variant.salePrice) : variant.salePrice) : null;
    const originalPrice = basePrice;
    let currentPrice = baseSalePrice || basePrice;
    if (product?.flashSale?.isActive) {
      const d = product.flashSale.discountPercentage || 0;
      currentPrice = Math.round((currentPrice - (currentPrice * d) / 100) * 100) / 100;
    }
    if (variant.pricingSlabs?.length > 0) {
      const sorted = [...variant.pricingSlabs].sort((a, b) => b.minQty - a.minQty);
      for (const slab of sorted) {
        if (qty >= slab.minQty && (slab.maxQty === null || qty <= slab.maxQty)) {
          let slabPrice = parseFloat(slab.price);
          if (product?.flashSale?.isActive) {
            const d = product.flashSale.discountPercentage || 0;
            slabPrice = Math.round((slabPrice - (slabPrice * d) / 100) * 100) / 100;
          }
          return { price: slabPrice, originalPrice, source: "SLAB", slab };
        }
      }
    }
    return { price: currentPrice, originalPrice, source: "DEFAULT", slab: null };
  };

  const calculateDiscount = (reg, sale) => {
    if (!reg || !sale || reg <= sale) return 0;
    return Math.round(((reg - sale) / reg) * 100);
  };

  /* ── Fetch product ───────────────────────────── */
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true); setInitialLoading(true);
      try {
        const response = await fetchApi(`/public/products/${slug}`);
        const productData = response.data.product;
        setProduct(productData);
        setRelatedProducts(response.data.relatedProducts || []);
        if (productData.images?.length > 0) setMainImage(productData.images[0]);
        if (productData.variants?.length > 0) {
          const combos = productData.variants
            .filter((v) => v.isActive && (v.stock > 0 || v.quantity > 0))
            .map((v) => ({ attributeValueIds: v.attributes?.map((a) => a.attributeValueId) || [], variant: v }));
          setAvailableCombinations(combos);
          if (productData.attributeOptions?.length > 0) {
            const defaults = {};
            productData.attributeOptions.forEach((attr) => { if (attr.values?.length) defaults[attr.id] = attr.values[0].id; });
            setSelectedAttributes(defaults);
            const match = combos.find((c) => c.attributeValueIds.sort().join(",") === Object.values(defaults).sort().join(","));
            const variant = match?.variant || productData.variants[0];
            setSelectedVariant(variant);
            const moq = variant.moq || 1; setQuantity(moq);
            setEffectivePriceInfo(getEffectivePrice(variant, moq));
          } else {
            const v = productData.variants[0]; setSelectedVariant(v);
            const moq = v.moq || 1; setQuantity(moq);
            setEffectivePriceInfo(getEffectivePrice(v, moq));
          }
        }
      } catch (err) { console.error(err); setError(err.message); }
      finally { setLoading(false); setInitialLoading(false); }
    };
    if (slug) fetchProductDetails();
  }, [slug]);

  /* ── Price visibility ────────────────────────── */
  useEffect(() => {
    fetchApi("/public/price-visibility-settings")
      .then((r) => { if (r.success) setPriceVisibilitySettings(r.data); })
      .catch(() => setPriceVisibilitySettings({ hidePricesForGuests: false }));
  }, []);

  /* ── Hash → reviews tab ──────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#reviews") setActiveTab("reviews");
  }, [slug]);
  useEffect(() => {
    const h = () => { if (window.location.hash === "#reviews") setActiveTab("reviews"); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  /* ── Attribute change ────────────────────────── */
  const handleAttributeChange = (attributeId, valueId) => {
    const next = { ...selectedAttributes, [attributeId]: valueId };
    setSelectedAttributes(next);
    const selIds = Object.values(next).sort();
    const match = availableCombinations.find((c) => {
      const ids = c.attributeValueIds.sort();
      return ids.length === selIds.length && ids.every((id, i) => id === selIds[i]);
    });
    if (match) {
      setSelectedVariant(match.variant);
      const moq = match.variant.moq || 1;
      const newQty = quantity < moq ? moq : quantity;
      if (quantity < moq) setQuantity(newQty);
      setEffectivePriceInfo(getEffectivePrice(match.variant, newQty));
    } else { setSelectedVariant(null); setEffectivePriceInfo(null); }
  };

  const getAvailableValuesForAttribute = (attrId) => {
    if (!product?.attributeOptions) return [];
    const attr = product.attributeOptions.find((a) => a.id === attrId);
    if (!attr?.values) return [];
    const others = { ...selectedAttributes }; delete others[attrId];
    const avail = new Set();
    availableCombinations.forEach((combo) => {
      const otherIds = Object.values(others);
      if (otherIds.length === 0 || otherIds.every((id) => combo.attributeValueIds.includes(id))) {
        combo.variant.attributes?.forEach((a) => { if (a.attributeId === attrId) avail.add(a.attributeValueId); });
      }
    });
    return attr.values.filter((v) => avail.has(v.id));
  };

  /* ── Wishlist ────────────────────────────────── */
  useEffect(() => {
    if (!isAuthenticated || !product) return;
    fetchApi("/users/wishlist", { credentials: "include" })
      .then((r) => { setIsInWishlist((r.data.wishlistItems || []).some((i) => i.productId === product.id)); })
      .catch((e) => console.error(e));
  }, [isAuthenticated, product]);

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) { router.push(`/auth?redirect=/products/${slug}`); return; }
    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        const r = await fetchApi("/users/wishlist", { credentials: "include" });
        const item = r.data.wishlistItems.find((i) => i.productId === product.id);
        if (item) { await fetchApi(`/users/wishlist/${item.id}`, { method: "DELETE", credentials: "include" }); setIsInWishlist(false); }
      } else {
        await fetchApi("/users/wishlist", { method: "POST", credentials: "include", body: JSON.stringify({ productId: product.id }) });
        setIsInWishlist(true);
      }
    } catch (e) { console.error(e); } finally { setIsAddingToWishlist(false); }
  };

  /* ── Quantity ────────────────────────────────── */
  const handleQuantityChange = (delta) => {
    const next = quantity + delta;
    const moq = selectedVariant?.moq || 1;
    if (next < moq) return;
    const stock = selectedVariant?.stock || selectedVariant?.quantity || 0;
    if (stock > 0 && next > stock) return;
    setQuantity(next);
    if (selectedVariant) setEffectivePriceInfo(getEffectivePrice(selectedVariant, next));
  };

  /* ── Add to Cart / Buy Now ───────────────────── */
  const handleAddToCart = async () => {
    const variant = selectedVariant || product?.variants?.[0];
    if (!variant) return;
    setIsAddingToCart(true); setCartSuccess(false);
    try {
      const r = await addVariantToCart(variant, quantity, product.name);
      if (r.success) { setCartSuccess(true); setTimeout(() => setCartSuccess(false), 3000); }
    } catch (e) { console.error(e); } finally { setIsAddingToCart(false); }
  };

  const handleBuyNow = async () => {
    const variant = selectedVariant || product?.variants?.[0];
    if (!variant) return;
    setIsAddingToCart(true);
    try {
      const r = await addVariantToCart(variant, quantity, product.name);
      if (r.success) router.push("/checkout");
    } catch (e) { console.error(e); } finally { setIsAddingToCart(false); }
  };

  /* ── Images renderer ─────────────────────────── */
  const renderImages = () => {
    let imgs = [];
    if (selectedVariant?.images?.length) imgs = selectedVariant.images;
    else if (product?.images?.length) imgs = product.images;
    else { const vImg = product?.variants?.find((v) => v.images?.length); if (vImg) imgs = vImg.images; }

    const Badges = () => (
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <span className="bg-[#C9933A] text-[#3F1F00] font-sans text-[9px] font-bold tracking-[0.12em] px-3 py-1 rounded-full shadow-sm">PURE A2</span>
        <span className="bg-[#092D15] text-[#C9933A] font-sans text-[9px] font-bold tracking-[0.12em] px-3 py-1 rounded-full shadow-sm">BILONA CRAFTED</span>
        <span className="bg-white border border-[#C9933A]/40 text-[#C9933A] font-sans text-[9px] font-semibold tracking-[0.08em] px-3 py-1 rounded-full shadow-sm">LAB TESTED</span>
      </div>
    );

    if (imgs.length === 0) return (
      <div className="relative aspect-square w-full bg-[#F5EDD5] rounded-2xl overflow-hidden border border-[#C9933A]/20">
        <Image src="/images/product-placeholder.jpg" alt={product?.name || "Product"} fill className="object-contain" priority />
        <Badges />
      </div>
    );

    const primary = imgs.find((i) => i.isPrimary) || imgs[0];
    const currentMain = mainImage && imgs.some((i) => i.url === mainImage.url) ? mainImage : primary;

    return (
      <div className="space-y-3">
        <div className="relative aspect-square w-full bg-[#F5EDD5] rounded-2xl overflow-hidden border border-[#C9933A]/20 group"
          style={{ boxShadow: "0 8px 40px rgba(63,31,0,0.10)" }}>
          <Image src={getImageUrl(currentMain?.url)} alt={product?.name || "Product"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
          <Badges />
        </div>
        {imgs.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {imgs.map((img, i) => (
              <button key={i} onClick={() => setMainImage(img)}
                className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${currentMain?.url === img.url ? "border-[#C9933A] ring-2 ring-[#C9933A]/25 scale-105" : "border-transparent hover:border-[#C9933A]/50 opacity-70 hover:opacity-100"}`}>
                <Image src={getImageUrl(img.url)} alt={`${product.name} ${i + 1}`} width={72} height={72} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Price display ───────────────────────────── */
  const getPriceDisplay = () => {
    if (initialLoading || priceVisibilitySettings === null) {
      return <div className="h-14 w-52 bg-[#C9933A]/15 animate-pulse rounded-xl" />;
    }

    const hidePrices = priceVisibilitySettings?.hidePricesForGuests && !isAuthenticated;
    if (hidePrices) {
      return (
        <div className="bg-[#FDF6E3] border border-[#C9933A]/30 rounded-xl px-4 py-3 inline-flex items-center gap-2">
          <RiInformationLine className="w-4 h-4 text-[#C9933A]" />
          <span className="font-sans text-sm text-[#5C3A1E]">
            <Link href={`/auth?redirect=/products/${slug}`} className="text-[#C9933A] font-semibold hover:underline">Login</Link> to view price
          </span>
        </div>
      );
    }

    const variant = selectedVariant;
    if (variant) {
      const info = effectivePriceInfo || getEffectivePrice(variant, quantity);
      if (!info) return <span className="font-sans text-xl text-[#C9933A]/60">Price not available</span>;
      const { price, originalPrice, source } = info;
      const isFlash = product?.flashSale?.isActive;
      const disc = originalPrice > price ? calculateDiscount(originalPrice, price) : 0;
      return (
        <div>
          <div className="flex items-baseline gap-3 flex-wrap mb-2">
            <span className=" text-5xl font-bold text-[#C9933A] leading-none">{formatCurrency(price)}</span>
            {originalPrice > price && (
              <>
                <span className=" text-2xl text-[#8B6040] line-through">{formatCurrency(originalPrice)}</span>
                {disc > 0 && (
                  <span className={`flex items-center gap-1 text-[11px] font-sans font-bold px-2.5 py-1 rounded-full ${isFlash ? "bg-[#3F1F00] text-[#C9933A]" : "bg-green-600 text-white"}`}>
                    {isFlash && <RiFlashlightLine className="w-3 h-3" />} {disc}% OFF
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isFlash && <span className="font-sans text-[11px] text-[#C9933A] flex items-center gap-1"><RiFlashlightLine className="w-3 h-3" /> Flash Sale Price</span>}
            {source === "SLAB" && <span className="font-sans text-[11px] text-green-600">Bulk pricing for {quantity} units</span>}
            <span className="font-sans text-[11px] text-[#8B6040]">Inclusive of all taxes</span>
          </div>
        </div>
      );
    }

    if (product) {
      const base = product.basePrice || 0, reg = product.regularPrice || 0;
      if (product.hasSale && base > 0 && reg > base) {
        const disc = calculateDiscount(reg, base);
        return (
          <div>
            <div className="flex items-baseline gap-3 flex-wrap mb-1">
              <span className=" text-5xl font-bold text-[#C9933A] leading-none">{formatCurrency(base)}</span>
              <span className=" text-2xl text-[#8B6040] line-through">{formatCurrency(reg)}</span>
              {disc > 0 && <span className="bg-green-600 text-white text-[11px] font-sans font-bold px-2.5 py-1 rounded-full">{disc}% OFF</span>}
            </div>
            <span className="font-sans text-[11px] text-[#8B6040]">Inclusive of all taxes</span>
          </div>
        );
      }
      if (base > 0) return (
        <div>
          <span className=" text-5xl font-bold text-[#C9933A] leading-none">{formatCurrency(base)}</span>
          <p className="font-sans text-[11px] text-[#8B6040] mt-1">Inclusive of all taxes</p>
        </div>
      );
    }
    return <span className="font-sans text-xl text-[#C9933A]/60">Price not available</span>;
  };

  /* ════════════════════════════════════════════
     LOADING / ERROR / NOT FOUND
  ════════════════════════════════════════════ */
  if (loading) return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
      <div className="text-center">
        <RiLoader4Line className="w-12 h-12 text-[#C9933A] animate-spin mx-auto mb-4" />
        <p className=" italic text-[#6B4423] text-xl">Loading product...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl border border-[#C9933A]/20 text-center max-w-md" style={{ boxShadow: "0 8px 40px rgba(63,31,0,0.08)" }}>
        <div className="w-14 h-14 rounded-2xl bg-[#C9933A]/10 flex items-center justify-center mx-auto mb-4">
          <RiAlertLine className="w-7 h-7 text-[#C9933A]" />
        </div>
        <h2 className=" text-2xl font-semibold text-[#3F1F00] mb-2">Product Unavailable</h2>
        <p className="font-sans text-sm text-[#5C3A1E] mb-6">{error}</p>
        <Link href="/products"><button className="btn-gold gap-2 text-sm">Browse Products <RiArrowRightSLine className="w-4 h-4" /></button></Link>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl border border-[#C9933A]/20 text-center max-w-md" style={{ boxShadow: "0 8px 40px rgba(63,31,0,0.08)" }}>
        <div className="w-14 h-14 rounded-2xl bg-[#C9933A]/10 flex items-center justify-center mx-auto mb-4">
          <RiBox3Line className="w-7 h-7 text-[#C9933A]" />
        </div>
        <h2 className=" text-2xl font-semibold text-[#3F1F00] mb-2">Product Not Found</h2>
        <p className="font-sans text-sm text-[#5C3A1E] mb-6">This product doesn&apos;t exist or has been removed.</p>
        <Link href="/products"><button className="btn-gold gap-2 text-sm">Browse Products <RiArrowRightSLine className="w-4 h-4" /></button></Link>
      </div>
    </div>
  );

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews",     label: `Reviews (${product.reviewCount || 0})` },
    { id: "shipping",    label: "Shipping & Returns" },
  ];

  const trustBadges = [
    { icon: RiTruckLine,      text: "Free Delivery ₹999+" },
    { icon: RiRefreshLine,    text: "Easy Returns" },
    { icon: RiShieldCheckLine,text: "Lab Certified" },
    { icon: RiLeafLine,       text: "100% Pure A2" },
  ];

  const inStock = selectedVariant ? (selectedVariant.stock > 0 || selectedVariant.quantity > 0) : true;

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="bg-[#FDF6E3] min-h-screen">

      {/* ── Breadcrumb ──────────────────────────── */}
      <div className="border-b border-[#C9933A]/12 bg-white/60 backdrop-blur-sm py-3 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-0.5 text-[11.5px] font-sans">
          {[
            { label: "Home",     href: "/" },
            { label: "Products", href: "/products" },
            ...(product?.category || product?.categories?.[0]?.category ? [{
              label: product.category?.name || product.categories[0]?.category?.name,
              href: `/category/${product.category?.slug || product.categories[0]?.category?.slug}`,
            }] : []),
          ].map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-0.5">
              {i > 0 && <RiArrowRightSLine className="w-3.5 h-3.5 text-[#C9933A]/40 mx-0.5" />}
              <Link href={crumb.href} className="text-[#8B6040] hover:text-[#C9933A] transition-colors">{crumb.label}</Link>
            </span>
          ))}
          <RiArrowRightSLine className="w-3.5 h-3.5 text-[#C9933A]/40 mx-0.5" />
          <span className="text-[#C9933A] font-medium truncate max-w-[180px]">{product.name}</span>
        </div>
      </div>

      {/* ── Main Product Section ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-14">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* ── LEFT: Images ── */}
          <div className="w-full lg:w-[48%] flex-shrink-0">
            {renderImages()}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex-1 space-y-5">

            {/* Brand */}
            <div>
              {product.brand
                ? <Link href={`/brand/${product.brand.slug}`} className="font-sans text-[10px] font-bold tracking-[0.22em] text-[#C9933A] uppercase hover:underline">{product.brand?.name ?? product.brand ?? product.brandName ?? ""}</Link>
                : <span className="font-sans text-[10px] font-bold tracking-[0.22em] text-[#C9933A] uppercase">AASHEY · PURE A2 COW GHEE</span>
              }
            </div>

            {/* Name + Rating */}
            <div>
              <h1 className=" text-4xl md:text-5xl font-semibold text-[#3F1F00] leading-tight">
                {product.name}
              </h1>
              {product.avgRating >= 0 && (
                <div className="flex items-center gap-2.5 mt-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      i < Math.round(product.avgRating || 0)
                        ? <RiStarFill key={i} className="w-3.5 h-3.5 text-[#F5A623]" />
                        : <RiStarLine key={i} className="w-3.5 h-3.5 text-[#C9933A]/25" />
                    ))}
                  </div>
                  <span className="font-sans text-[13px] font-semibold text-[#3F1F00]">{product.avgRating || "0"}</span>
                  <span className="w-px h-3.5 bg-[#C9933A]/25" />
                  <a href="#reviews" onClick={() => setActiveTab("reviews")} className="font-sans text-[13px] text-[#C9933A] hover:underline cursor-pointer">
                    {product.reviewCount || 0} reviews
                  </a>
                </div>
              )}
            </div>

            {/* Flash Sale Banner */}
            {product.flashSale?.isActive && (
              <div className="flex items-center justify-between gap-3 p-4 bg-[#3F1F00] rounded-xl border border-[#C9933A]/30">
                <div className="flex items-center gap-2.5">
                  <RiFlashlightLine className="w-5 h-5 text-[#C9933A] flex-shrink-0" />
                  <div>
                    <p className=" font-bold text-[#FDF6E3] text-lg leading-tight">Flash Sale</p>
                    <p className="font-sans text-[12px] text-[#FDF6E3]/55">{product.flashSale.name}</p>
                  </div>
                </div>
                <div className="bg-[#C9933A] px-4 py-2 rounded-lg flex-shrink-0">
                  <span className=" font-bold text-2xl text-[#3F1F00]">{product.flashSale.discountPercentage}% OFF</span>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="py-1">{getPriceDisplay()}</div>

            {/* Short Description */}
            {product.shortDescription && (
              <div className="flex gap-3 bg-white rounded-xl p-4 border border-[#C9933A]/15">
                <div className="w-0.5 bg-[#C9933A] rounded-full flex-shrink-0" />
                <p className="font-sans text-[13.5px] text-[#5C3A1E] leading-relaxed">{product.shortDescription}</p>
              </div>
            )}

            {/* Attribute selectors */}
            {product.attributeOptions?.length > 0 && (
              <div className="space-y-5">
                {product.attributeOptions.map((attr) => {
                  const avail = getAvailableValuesForAttribute(attr.id);
                  const selId = selectedAttributes[attr.id];
                  return (
                    <div key={attr.id}>
                      <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#3F1F00]/60 mb-3">
                        Select {attr.name}
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {avail.length > 0 ? avail.map((val) => {
                          const active = selId === val.id;
                          return (
                            <button key={val.id} onClick={() => handleAttributeChange(attr.id, val.id)}
                              className={`border-2 rounded-xl px-5 py-2.5 font-sans text-[13px] font-semibold transition-all duration-200 ${active
                                ? "bg-[#3F1F00] text-[#FDF6E3] border-[#3F1F00] shadow-[0_4px_16px_rgba(63,31,0,0.18)]"
                                : "bg-white border-[#C9933A]/25 text-[#3F1F00] hover:border-[#C9933A] hover:bg-[#FDF6E3]"}`}>
                              {val.value}
                            </button>
                          );
                        }) : <p className="font-sans text-sm text-[#8B6040]">No {attr.name} options available</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cart success */}
            {cartSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-green-50 text-green-700 rounded-xl border border-green-200">
                <RiCheckboxCircleLine className="w-4 h-4 flex-shrink-0" />
                <span className="font-sans text-[13px] font-medium">Added to cart successfully!</span>
              </div>
            )}

            {/* MOQ notice */}
            {selectedVariant?.moq > 1 && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#FDF6E3] border border-[#C9933A]/25 rounded-xl">
                <RiInformationLine className="w-4 h-4 text-[#C9933A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-[13px] font-semibold text-[#3F1F00]">Minimum Order: {selectedVariant.moq} units</p>
                  <p className="font-sans text-[11.5px] text-[#8B6040] mt-0.5">Order at least {selectedVariant.moq} units to proceed</p>
                </div>
              </div>
            )}

            {/* Stock status */}
            {selectedVariant && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-sans text-[13px] font-medium ${inStock ? "text-green-700" : "text-red-600"}`}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="space-y-3">
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#3F1F00]/60">Quantity</p>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Quantity pill */}
                <div className="flex items-center rounded-xl overflow-hidden border border-[#C9933A]/30 bg-white">
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= (selectedVariant?.moq || 1) || isAddingToCart}
                    className="w-10 h-10 flex items-center justify-center font-bold text-lg text-[#3F1F00] hover:bg-[#FDF6E3] disabled:opacity-30 transition-colors">
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center  font-bold text-xl text-[#3F1F00] border-x border-[#C9933A]/20">
                    {quantity}
                  </span>
                  <button onClick={() => handleQuantityChange(1)}
                    disabled={(inStock && quantity >= (selectedVariant?.stock || selectedVariant?.quantity || 999)) || isAddingToCart}
                    className="w-10 h-10 flex items-center justify-center font-bold text-lg text-[#3F1F00] hover:bg-[#FDF6E3] disabled:opacity-30 transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* CTA row */}
              <div className="flex gap-2.5 mt-1">
                {/* Add to Cart */}
                <button onClick={handleAddToCart}
                  disabled={isAddingToCart || !inStock}
                  className="flex-1 h-13 py-3.5 rounded-xl bg-[#3F1F00] text-[#FDF6E3] font-sans font-bold text-[13px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#5C2E00] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAddingToCart
                    ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> Adding...</>
                    : <><RiShoppingCartLine className="w-4 h-4" /> Add to Cart</>
                  }
                </button>

                {/* Wishlist */}
                <button onClick={handleAddToWishlist} disabled={isAddingToWishlist}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  className={`w-13 h-13 py-3.5 px-4 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isInWishlist ? "bg-[#C9933A]/10 border-[#C9933A] text-[#C9933A]" : "bg-white border-[#C9933A]/30 text-[#3F1F00] hover:border-[#C9933A] hover:text-[#C9933A]"}`}>
                  {isInWishlist ? <RiHeartFill className="w-5 h-5" /> : <RiHeartLine className="w-5 h-5" />}
                </button>
              </div>

           
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {trustBadges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 bg-white rounded-xl px-3 py-3 border border-[#C9933A]/12 text-center">
                  <Icon className="w-4 h-4 text-[#C9933A]" />
                  <span className="font-sans text-[10.5px] font-medium text-[#5C3A1E] leading-tight">{text}</span>
                </div>
              ))}
            </div>

            {/* Delivery info card */}
            <div className="bg-white rounded-xl border border-[#C9933A]/15 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#C9933A]/10 bg-[#FDF6E3]/50">
                <p className=" font-semibold text-[#3F1F00] text-[15px]">Delivery Information</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { Icon: RiTruckLine,       text: "Free shipping on orders above ₹999. Standard delivery in 3–5 business days." },
                  { Icon: RiRefreshLine,     text: "30-day easy return policy. Initiate return from your account." },
                  { Icon: RiShieldCheckLine, text: "100% authentic, lab-tested A2 cow ghee with FSSAI certification." },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#C9933A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-[#C9933A]" />
                    </div>
                    <p className="font-sans text-[12.5px] text-[#5C3A1E] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta: SKU + Category */}
            {(selectedVariant?.sku || product.category) && (
              <div className="border-t border-[#C9933A]/12 pt-4 space-y-1.5">
                {selectedVariant?.sku && (
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-[10.5px] font-semibold uppercase tracking-wider text-[#8B6040] w-20">SKU</span>
                    <span className="font-sans text-[12.5px] text-[#5C3A1E]">{selectedVariant.sku}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-[10.5px] font-semibold uppercase tracking-wider text-[#8B6040] w-20">Category</span>
                    <Link href={`/category/${product.category?.slug}`} className="font-sans text-[12.5px] text-[#C9933A] hover:underline">{product.category?.name}</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────── */}
      <div id="reviews" className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pb-16">
        <div className="bg-white rounded-2xl border border-[#C9933A]/15 overflow-hidden" style={{ boxShadow: "0 4px 32px rgba(63,31,0,0.06)" }}>

          {/* Tab nav */}
          <div className="flex border-b border-[#C9933A]/12 bg-[#FDF6E3]/40 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-sans text-[11.5px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                  ? "text-[#3F1F00] border-b-2 border-[#C9933A] bg-white"
                  : "text-[#8B6040] hover:text-[#5C3A1E]"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10">

            {/* Description */}
            {activeTab === "description" && (
              <div className="max-w-3xl">
                <div className="font-sans text-[14.5px] text-[#3F1F00] leading-relaxed prose prose-p:mb-4"
                  dangerouslySetInnerHTML={{ __html: product.description || "" }} />
                {product.directions && (
                  <div className="mt-8 p-6 bg-[#FDF6E3] rounded-xl border border-[#C9933A]/15">
                    <h3 className=" font-semibold text-[#3F1F00] text-xl mb-5">Directions for Use</h3>
                    <div className="space-y-4">
                      {product.directions.split("\n").filter(Boolean).map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-[#C9933A] flex items-center justify-center flex-shrink-0">
                            <span className=" font-bold text-[#3F1F00] text-base">{i + 1}</span>
                          </div>
                          <p className="font-sans text-[13.5px] text-[#5C3A1E] mt-1">{step}</p>
                        </div>
                      ))}
                      {!product.directions.includes("\n") && <p className="font-sans text-[13.5px] text-[#5C3A1E]">{product.directions}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && <ReviewSection product={product} />}

            {/* Shipping */}
            {activeTab === "shipping" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl">
                {[
                  {
                    title: "Shipping Information",
                    items: [
                      { label: "Delivery Time", value: "3–5 business days (standard)" },
                      { label: "Free Shipping", value: "Free on all orders above ₹999" },
                      { label: "Express Delivery", value: "1–2 business days (₹199 extra)" },
                    ]
                  },
                  {
                    title: "Return Policy",
                    items: [
                      { label: "Return Window", value: "30 days from delivery" },
                      { label: "Condition", value: "Unused, original packaging" },
                      { label: "Process", value: "Initiate from your account, we'll arrange pickup" },
                    ]
                  }
                ].map(({ title, items }) => (
                  <div key={title}>
                    <h3 className=" font-semibold text-[#3F1F00] text-xl mb-5">{title}</h3>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-[#C9933A]/10">
                          <RiArrowRightSLine className="w-4 h-4 text-[#C9933A] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-sans text-[12.5px] font-semibold text-[#3F1F00]">{item.label}</p>
                            <p className="font-sans text-[12.5px] text-[#5C3A1E] mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Related Products ─────────────────────── */}
      {relatedProducts?.length > 0 && (
        <div className="bg-white border-t border-[#C9933A]/12 py-16 md:py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="section-eyebrow">Explore More</span>
                <h2 className=" text-4xl md:text-5xl font-semibold text-[#3F1F00] mt-1 leading-tight">
                  You May Also Like
                </h2>
                <div className="w-10 h-px bg-gradient-to-r from-[#C9933A] to-transparent mt-4" />
              </div>
              <span className="font-sans text-[13px] text-[#8B6040] pb-1 hidden sm:block">
                {relatedProducts.length} related product{relatedProducts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}