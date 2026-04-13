"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Star, Minus, Plus, AlertCircle, ShoppingCart, Heart,
  ChevronRight, CheckCircle, Truck, RefreshCw, ShieldCheck,
  Leaf, Zap, Package
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import ReviewSection from "./ReviewSection";
import { useAddVariantToCart } from "@/lib/cart-utils";
import { ProductCard } from "@/components/products/ProductCard";
import { getImageUrl } from "@/lib/imageUrl";

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

  // Calculate effective price based on quantity and pricing slabs
  const getEffectivePrice = (variant, qty) => {
    if (!variant) return null;

    const basePrice = variant.price ? (typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price) : 0;
    const baseSalePrice = variant.salePrice ? (typeof variant.salePrice === 'string' ? parseFloat(variant.salePrice) : variant.salePrice) : null;
    
    // originalPrice should always be the true base price (non-discounted)
    const originalPrice = basePrice;
    
    // Default price is sale price if it exists, otherwise base price
    let currentPrice = baseSalePrice || basePrice;

    // Apply flash sale discount if active
    if (product?.flashSale?.isActive) {
      const discountPercentage = product.flashSale.discountPercentage || 0;
      const discountAmount = (currentPrice * discountPercentage) / 100;
      currentPrice = Math.round((currentPrice - discountAmount) * 100) / 100;
    }

    if (variant.pricingSlabs && variant.pricingSlabs.length > 0) {
      const sortedSlabs = [...variant.pricingSlabs].sort((a, b) => b.minQty - a.minQty);

      for (const slab of sortedSlabs) {
        if (qty >= slab.minQty && (slab.maxQty === null || qty <= slab.maxQty)) {
          let slabPrice = parseFloat(slab.price);
          // Apply flash sale to slab price too
          if (product?.flashSale?.isActive) {
            const discountPercentage = product.flashSale.discountPercentage || 0;
            const discountAmount = (slabPrice * discountPercentage) / 100;
            slabPrice = Math.round((slabPrice - discountAmount) * 100) / 100;
          }
          return { price: slabPrice, originalPrice: originalPrice, source: 'SLAB', slab: slab };
        }
      }
    }

    return { price: currentPrice, originalPrice: originalPrice, source: 'DEFAULT', slab: null };
  };

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setInitialLoading(true);
      try {
        const response = await fetchApi(`/public/products/${slug}`);
        const productData = response.data.product;

        setProduct(productData);
        setRelatedProducts(response.data.relatedProducts || []);

        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0]);
        }

        if (productData.variants && productData.variants.length > 0) {
          const combinations = productData.variants
            .filter((v) => v.isActive && (v.stock > 0 || v.quantity > 0))
            .map((variant) => ({
              attributeValueIds: variant.attributes ? variant.attributes.map((a) => a.attributeValueId) : [],
              variant: variant,
            }));

          setAvailableCombinations(combinations);

          if (productData.attributeOptions && productData.attributeOptions.length > 0) {
            const defaultSelections = {};

            productData.attributeOptions.forEach((attr) => {
              if (attr.values && attr.values.length > 0) {
                defaultSelections[attr.id] = attr.values[0].id;
              }
            });

            setSelectedAttributes(defaultSelections);

            const matchingVariant = combinations.find((combo) => {
              const comboIds = combo.attributeValueIds.sort().join(",");
              const selectedIds = Object.values(defaultSelections).sort().join(",");
              return comboIds === selectedIds;
            });

            if (matchingVariant) {
              setSelectedVariant(matchingVariant.variant);
              const moq = matchingVariant.variant.moq || 1;
              setQuantity(moq);
              const priceInfo = getEffectivePrice(matchingVariant.variant, moq);
              setEffectivePriceInfo(priceInfo);
            } else if (productData.variants.length > 0) {
              setSelectedVariant(productData.variants[0]);
              const moq = productData.variants[0].moq || 1;
              setQuantity(moq);
              const priceInfo = getEffectivePrice(productData.variants[0], moq);
              setEffectivePriceInfo(priceInfo);
            }
          } else if (productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
            const moq = productData.variants[0].moq || 1;
            setQuantity(moq);
            const priceInfo = getEffectivePrice(productData.variants[0], moq);
            setEffectivePriceInfo(priceInfo);
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  // Fetch price visibility settings
  useEffect(() => {
    const fetchPriceVisibilitySettings = async () => {
      try {
        const response = await fetchApi("/public/price-visibility-settings");
        if (response.success) {
          setPriceVisibilitySettings(response.data);
        }
      } catch (error) {
        console.error("Error fetching price visibility settings:", error);
        setPriceVisibilitySettings({ hidePricesForGuests: false });
      }
    };

    fetchPriceVisibilitySettings();
  }, []);

  // Open reviews tab when navigating with #reviews hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash === "#reviews") setActiveTab("reviews");
  }, [slug]);

  useEffect(() => {
    const handler = () => {
      if (window.location.hash === "#reviews") setActiveTab("reviews");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Handle attribute value change
  const handleAttributeChange = (attributeId, attributeValueId) => {
    const newSelections = { ...selectedAttributes, [attributeId]: attributeValueId };
    setSelectedAttributes(newSelections);

    const selectedValueIds = Object.values(newSelections).sort();
    const matchingVariant = availableCombinations.find((combo) => {
      const comboIds = combo.attributeValueIds.sort();
      return comboIds.length === selectedValueIds.length && comboIds.every((id, idx) => id === selectedValueIds[idx]);
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant.variant);
      const moq = matchingVariant.variant.moq || 1;
      const newQty = quantity < moq ? moq : quantity;
      if (quantity < moq) {
        setQuantity(newQty);
      }
      const priceInfo = getEffectivePrice(matchingVariant.variant, newQty);
      setEffectivePriceInfo(priceInfo);
    } else {
      setSelectedVariant(null);
      setEffectivePriceInfo(null);
    }
  };

  // Get available values for an attribute
  const getAvailableValuesForAttribute = (attributeId) => {
    if (!product?.attributeOptions) return [];

    const attribute = product.attributeOptions.find((attr) => attr.id === attributeId);
    if (!attribute || !attribute.values) return [];

    const otherSelections = { ...selectedAttributes };
    delete otherSelections[attributeId];

    const availableValueIds = new Set();
    availableCombinations.forEach((combo) => {
      const comboValueIds = combo.attributeValueIds;
      const otherSelectedIds = Object.values(otherSelections);

      const matchesOtherSelections = otherSelectedIds.length === 0 || otherSelectedIds.every((id) => comboValueIds.includes(id));

      if (matchesOtherSelections) {
        combo.variant.attributes?.forEach((attr) => {
          if (attr.attributeId === attributeId) {
            availableValueIds.add(attr.attributeValueId);
          }
        });
      }
    });

    return attribute.values.filter((val) => availableValueIds.has(val.id));
  };

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !product) return;

      try {
        const response = await fetchApi("/users/wishlist", { credentials: "include" });
        const wishlistItems = response.data.wishlistItems || [];
        const inWishlist = wishlistItems.some((item) => item.productId === product.id);
        setIsInWishlist(inWishlist);
      } catch (error) {
        console.error("Failed to check wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [isAuthenticated, product]);

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const effectiveMOQ = selectedVariant?.moq || 1;

    if (newQuantity < effectiveMOQ) return;

    const availableStock = selectedVariant?.stock || selectedVariant?.quantity || 0;
    if (availableStock > 0 && newQuantity > availableStock) return;

    setQuantity(newQuantity);

    if (selectedVariant) {
      const priceInfo = getEffectivePrice(selectedVariant, newQuantity);
      setEffectivePriceInfo(priceInfo);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      if (product?.variants && product.variants.length > 0) {
        setIsAddingToCart(true);
        setCartSuccess(false);

        try {
          const result = await addVariantToCart(product.variants[0], quantity, product.name);
          if (result.success) {
            setCartSuccess(true);
            setTimeout(() => { setCartSuccess(false); }, 3000);
          }
        } catch (err) {
          console.error("Error adding to cart:", err);
        } finally {
          setIsAddingToCart(false);
        }
      }
      return;
    }

    setIsAddingToCart(true);
    setCartSuccess(false);

    try {
      const result = await addVariantToCart(selectedVariant, quantity, product.name);
      if (result.success) {
        setCartSuccess(true);
        setTimeout(() => { setCartSuccess(false); }, 3000);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    const variantToUse = selectedVariant || (product?.variants && product.variants.length > 0 ? product.variants[0] : null);

    if (!variantToUse) return;

    setIsAddingToCart(true);

    try {
      const result = await addVariantToCart(variantToUse, quantity, product.name);
      if (result.success) {
        router.push("/checkout");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Render product images
  const renderImages = () => {
    let imagesToShow = [];

    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      imagesToShow = selectedVariant.images;
    } else if (product && product.images && product.images.length > 0) {
      imagesToShow = product.images;
    } else if (product && product.variants && product.variants.length > 0) {
      const variantWithImages = product.variants.find((variant) => variant.images && variant.images.length > 0);
      if (variantWithImages) {
        imagesToShow = variantWithImages.images;
      }
    }

    if (imagesToShow.length === 0) {
      return (
        <div className="relative aspect-square w-full bg-[#F5EDD5] rounded-xl overflow-hidden border border-[#C9933A]/20 shadow-[0_8px_48px_rgba(63,31,0,0.08)]">
          <Image src="/images/product-placeholder.jpg" alt={product?.name || "Product"} fill className="object-contain" priority />
        </div>
      );
    }

    if (imagesToShow.length === 1) {
      return (
        <div className="relative aspect-square w-full bg-[#F5EDD5] rounded-xl overflow-hidden border border-[#C9933A]/20 shadow-[0_8px_48px_rgba(63,31,0,0.08)] group">
          <Image src={getImageUrl(imagesToShow[0].url)} alt={product?.name || "Product"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span className="bg-[#C9933A] text-[#3F1F00] font-sans text-[10px] font-bold tracking-[0.08em] px-3 py-1 rounded-full">PURE A2</span>
            <span className="bg-[#092D15] text-[#C9933A] font-sans text-[10px] font-bold tracking-[0.08em] px-3 py-1 rounded-full">BILONA CRAFTED</span>
            <span className="bg-white border border-[#C9933A]/40 text-[#C9933A] font-sans text-[10px] font-semibold tracking-[0.06em] px-3 py-1 rounded-full">LAB TESTED</span>
          </div>
        </div>
      );
    }

    const primaryImage = imagesToShow.find((img) => img.isPrimary) || imagesToShow[0];
    const currentMainImage = mainImage && imagesToShow.some((img) => img.url === mainImage.url) ? mainImage : primaryImage;

    return (
      <div className="space-y-4">
        {/* Main image */}
        <div className="relative aspect-square w-full bg-[#F5EDD5] rounded-xl overflow-hidden border border-[#C9933A]/20 shadow-[0_8px_48px_rgba(63,31,0,0.08)] group">
          <Image src={getImageUrl(currentMainImage?.url)} alt={product?.name || "Product"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span className="bg-[#C9933A] text-[#3F1F00] font-sans text-[10px] font-bold tracking-[0.08em] px-3 py-1 rounded-full">PURE A2</span>
            <span className="bg-[#092D15] text-[#C9933A] font-sans text-[10px] font-bold tracking-[0.08em] px-3 py-1 rounded-full">BILONA CRAFTED</span>
            <span className="bg-white border border-[#C9933A]/40 text-[#C9933A] font-sans text-[10px] font-semibold tracking-[0.06em] px-3 py-1 rounded-full">LAB TESTED</span>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {imagesToShow.map((image, index) => (
            <button
              key={index}
              onClick={() => setMainImage(image)}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${currentMainImage?.url === image.url ? "border-[#C9933A] ring-2 ring-[#C9933A]/30" : "border-transparent hover:border-[#C9933A]/50"}`}
            >
              <Image src={getImageUrl(image.url)} alt={`${product.name} - ${index + 1}`} width={80} height={80} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Calculate discount percentage
  const calculateDiscount = (regularPrice, salePrice) => {
    if (!regularPrice || !salePrice || regularPrice <= salePrice) return 0;
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  // Format price display
  const getPriceDisplay = () => {
    if (initialLoading) {
      return <div className="h-12 w-48 bg-[#C9933A]/15 animate-pulse rounded-xl" />;
    }

    if (priceVisibilitySettings === null) {
      // Still fetching price visibility settings — show skeleton, don't assume login required
      return <div className="h-12 w-48 bg-[#C9933A]/15 animate-pulse rounded-xl" />;
    }

    if (selectedVariant) {
      const priceInfo = effectivePriceInfo || getEffectivePrice(selectedVariant, quantity);

      if (!priceInfo) {
        return <span className="font-sans text-2xl font-semibold text-[#C9933A]/60">Price not available</span>;
      }

      const effectivePrice = priceInfo.price;
      const originalPrice = priceInfo.originalPrice;
      const isSlabPrice = priceInfo.source === 'SLAB';
      const isFlashSale = product?.flashSale?.isActive;
      const discount = originalPrice > effectivePrice ? calculateDiscount(originalPrice, effectivePrice) : 0;

      if (priceVisibilitySettings?.hidePricesForGuests && !isAuthenticated) {
        return (
          <div>
            <span className="font-sans text-2xl font-semibold text-[#C9933A]/60">Login to view price</span>
            <p className="font-sans text-xs text-[#7A4E2D] mt-1">Please log in to see pricing information</p>
          </div>
        );
      }

      return (
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-playfair text-5xl font-bold text-[#C9933A] leading-none">{formatCurrency(effectivePrice)}</span>
            {originalPrice > effectivePrice && (
              <>
                <span className="font-playfair text-2xl font-semibold text-[#8B6040] line-through">{formatCurrency(originalPrice)}</span>
                {discount > 0 && (
                  <span className={`${isFlashSale ? "bg-[#3F1F00] text-[#C9933A]" : "bg-green-600 text-white"} text-xs font-sans font-bold px-2.5 py-1 rounded-full flex items-center gap-1`}>
                    {isFlashSale && <Zap className="w-3 h-3" />} {discount}% OFF
                  </span>
                )}
              </>
            )}
          </div>
          {isFlashSale && <p className="font-sans text-xs text-[#7A4E2D] font-medium flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#C9933A]" /> Flash Sale Price Applied</p>}
          {isSlabPrice && <p className="font-sans text-xs text-green-600 font-medium">Bulk pricing applied for {quantity} units</p>}
          <p className="font-sans text-xs text-[#7A4E2D]">Inclusive of all taxes</p>
        </div>
      );
    }

    if (product) {
      const basePrice = product.basePrice || 0;
      const regularPrice = product.regularPrice || 0;

      if (priceVisibilitySettings?.hidePricesForGuests && !isAuthenticated) {
        return (
          <div>
            <span className="font-sans text-2xl font-semibold text-[#C9933A]/60">Login to view price</span>
            <p className="font-sans text-xs text-[#7A4E2D] mt-1">Please log in to see pricing information</p>
          </div>
        );
      }

      if (product.hasSale && basePrice > 0 && regularPrice > basePrice) {
        const discount = calculateDiscount(regularPrice, basePrice);
        return (
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-playfair text-5xl font-bold text-[#C9933A] leading-none">{formatCurrency(basePrice)}</span>
              <span className="font-playfair text-2xl font-semibold text-[#8B6040] line-through">{formatCurrency(regularPrice)}</span>
              {discount > 0 && <span className="bg-green-600 text-white text-xs font-sans font-bold px-2.5 py-1 rounded-full">{discount}% OFF</span>}
            </div>
            <p className="font-sans text-xs text-[#7A4E2D]">Inclusive of all taxes</p>
          </div>
        );
      }

      if (basePrice > 0) {
        return (
          <div className="space-y-1.5">
            <span className="font-playfair text-5xl font-bold text-[#C9933A] leading-none">{formatCurrency(basePrice)}</span>
            <p className="font-sans text-xs text-[#7A4E2D] block mt-1">Inclusive of all taxes</p>
          </div>
        );
      }
    }

    return <span className="font-sans text-2xl font-semibold text-[#C9933A]/60">Price not available</span>;
  };

  // Handle add to wishlist
  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${slug}`);
      return;
    }

    setIsAddingToWishlist(true);

    try {
      if (isInWishlist) {
        const wishlistResponse = await fetchApi("/users/wishlist", { credentials: "include" });
        const wishlistItem = wishlistResponse.data.wishlistItems.find((item) => item.productId === product.id);

        if (wishlistItem) {
          await fetchApi(`/users/wishlist/${wishlistItem.id}`, { method: "DELETE", credentials: "include" });
          setIsInWishlist(false);
        }
      } else {
        await fetchApi("/users/wishlist", { method: "POST", credentials: "include", body: JSON.stringify({ productId: product.id }) });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="font-cormorant italic text-[#6B4423] text-xl">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg border border-[#C9933A]/20 shadow-sm text-center max-w-md">
          <AlertCircle className="text-[#C9933A] h-12 w-12 mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl font-semibold text-[#3F1F00] mb-2">Product Unavailable</h2>
          <p className="font-sans text-sm text-[#5C3A1E] mb-6">{error}</p>
          <Link href="/products">
            <button className="btn-gold gap-2 text-sm">Browse Products <ChevronRight className="w-4 h-4" /></button>
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg border border-[#C9933A]/20 shadow-sm text-center max-w-md">
          <Package className="text-[#C9933A] h-12 w-12 mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl font-semibold text-[#3F1F00] mb-2">Product Not Found</h2>
          <p className="font-sans text-sm text-[#5C3A1E] mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link href="/products">
            <button className="btn-gold gap-2 text-sm">Browse Products <ChevronRight className="w-4 h-4" /></button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: `Reviews (${product.reviewCount || 0})` },
    { id: "shipping", label: "Shipping & Returns" },
  ];

  return (
    <div className="bg-[#FDF6E3] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-[#FDF6E3] border-b border-[#C9933A]/15 py-3 px-4 md:px-16">
        <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-0.5">
          <Link href="/" className="font-sans text-xs font-medium text-[#3F1F00]/55 hover:text-[#3F1F00] transition-colors">Home</Link>
          <span className="text-[#C9933A]/50 mx-2 font-sans text-xs">/</span>
          <Link href="/products" className="font-sans text-xs font-medium text-[#3F1F00]/55 hover:text-[#3F1F00] transition-colors">Products</Link>
          {(product?.category || product?.categories?.[0]?.category) && (
            <>
              <span className="text-[#C9933A]/50 mx-2 font-sans text-xs">/</span>
              <Link
                href={`/category/${product.category?.slug || product.categories[0]?.category?.slug}`}
                className="font-sans text-xs font-medium text-[#3F1F00]/55 hover:text-[#3F1F00] transition-colors"
              >
                {product.category?.name || product.categories[0]?.category?.name}
              </Link>
            </>
          )}
          <span className="text-[#C9933A]/50 mx-2 font-sans text-xs">/</span>
          <span className="font-sans text-xs font-semibold text-[#C9933A] truncate max-w-[180px] sm:max-w-none">{product?.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* ── LEFT: Image Gallery ── */}
          <div className="w-full lg:w-1/2">
            {renderImages()}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Brand tag */}
            <div>
              {product.brand && (
                <Link href={`/brand/${product.brand.slug}`} className="font-sans text-xs font-semibold tracking-[0.12em] text-[#C9933A] uppercase hover:underline">
                  {product.brand?.name ?? product.brand ?? product.brandName ?? ""}
                </Link>
              )}
              {!product.brand && (
                <span className="font-sans text-xs font-semibold tracking-[0.12em] text-[#C9933A] uppercase">AASHEY · PURE A2 COW GHEE</span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="font-cormorant text-4xl md:text-5xl font-semibold text-[#3F1F00] leading-tight">
                {product.name}
              </h1>

              {/* Rating row */}
              {product.avgRating >= 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(product.avgRating || 0) ? "text-[#C9933A] fill-[#C9933A]" : "text-[#C9933A]/25"}`} />
                    ))}
                  </div>
                  <span className="font-sans text-sm text-[#6B4423]">{product.avgRating ? `${product.avgRating}` : "0"}</span>
                  <span className="text-[#C9933A]/30 font-sans text-sm">|</span>
                  <a href="#reviews" onClick={() => setActiveTab("reviews")} className="text-[#C9933A] text-sm hover:underline font-sans cursor-pointer">
                    {product.reviewCount || 0} reviews
                  </a>
                </div>
              )}
            </div>

            {/* Flash Sale Banner */}
            {product.flashSale?.isActive && (
              <div className="p-4 bg-gradient-to-r from-[#3F1F00] to-[#5C2E00] text-[#FDF6E3] rounded-lg border border-[#C9933A]/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#C9933A]" />
                    <div>
                      <p className="font-playfair font-bold text-lg text-[#FDF6E3]">Flash Sale</p>
                      <p className="font-sans text-sm text-[#FDF6E3]/70">{product.flashSale.name}</p>
                    </div>
                  </div>
                  <div className="bg-[#C9933A] px-4 py-2 rounded-full">
                    <span className="font-playfair font-bold text-xl text-[#3F1F00]">{product.flashSale.discountPercentage}% OFF</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              {getPriceDisplay()}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div className="border-l-4 border-[#C9933A] pl-4 py-2 bg-[#C9933A]/5 rounded-r-xl">
                <p className="font-sans text-sm text-[#5C3A1E] leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {/* Dynamic Attribute Selection */}
            {product.attributeOptions && product.attributeOptions.length > 0 && (
              <div className="space-y-5">
                {product.attributeOptions.map((attribute) => {
                  const availableValues = getAvailableValuesForAttribute(attribute.id);
                  const selectedValueId = selectedAttributes[attribute.id];

                  return (
                    <div key={attribute.id}>
                      <h3 className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-[#3F1F00] mb-3">
                        SELECT {attribute.name.toUpperCase()}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {availableValues.length > 0 ? (
                          availableValues.map((value) => {
                            const isSelected = selectedValueId === value.id;
                            return (
                              <button
                                key={value.id}
                                onClick={() => handleAttributeChange(attribute.id, value.id)}
                                className={`border-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-all duration-200 ${isSelected
                                  ? "bg-[#3F1F00] text-[#FDF6E3] border-[#3F1F00] shadow-[0_4px_16px_rgba(63,31,0,0.2)]"
                                  : "bg-white border-[#C9933A]/30 text-[#3F1F00] hover:border-[#C9933A] hover:bg-[#FDF6E3]"
                                  }`}
                              >
                                {value.value}
                              </button>
                            );
                          })
                        ) : (
                          <p className="font-sans text-sm text-[#6B4423]">No {attribute.name.toLowerCase()} options available</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cart Success */}
            {cartSuccess && (
              <div className="p-3.5 bg-green-50 text-green-700 text-sm rounded-xl flex items-center gap-2 border border-green-200">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-sans">Item successfully added to your cart!</span>
              </div>
            )}

            {/* MOQ Notice */}
            {selectedVariant && selectedVariant.moq && selectedVariant.moq > 1 && (
              <div className="p-3.5 bg-[#FDF6E3] border border-[#C9933A]/30 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-[#C9933A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-sans text-sm font-medium text-[#3F1F00]">Minimum Order: {selectedVariant.moq} units</p>
                    <p className="font-sans text-xs text-[#6B4423] mt-0.5">You need to order at least {selectedVariant.moq} units</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Status */}
            {selectedVariant && (
              <div>
                {(selectedVariant.stock > 0 || selectedVariant.quantity > 0) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="font-sans text-sm text-green-700">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="font-sans text-sm text-red-600">Out of stock</span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-[#3F1F00] mb-3">Quantity</h3>
              <div className="flex items-center w-fit rounded-full overflow-hidden border border-[#C9933A]/40">
                <button
                  className="w-11 h-11 bg-[#3F1F00] text-[#FDF6E3] font-bold text-xl flex items-center justify-center hover:bg-[#5C2E00] transition-colors disabled:opacity-40"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= (selectedVariant?.moq || 1) || isAddingToCart}
                >
                  −
                </button>
                <span className="w-14 h-11 flex items-center justify-center font-cormorant text-2xl font-semibold text-[#3F1F00] bg-white">
                  {quantity}
                </span>
                <button
                  className="w-11 h-11 bg-[#3F1F00] text-[#FDF6E3] font-bold text-xl flex items-center justify-center hover:bg-[#5C2E00] transition-colors disabled:opacity-40"
                  onClick={() => handleQuantityChange(1)}
                  disabled={(selectedVariant && (selectedVariant.stock > 0 || selectedVariant.quantity > 0) && quantity >= (selectedVariant.stock || selectedVariant.quantity)) || isAddingToCart}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Add to Cart */}
              <button
                className="flex-1 py-4 rounded-lg bg-[#3F1F00] text-[#FDF6E3] font-sans font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#5C2E00] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={isAddingToCart || (selectedVariant && selectedVariant.quantity < 1) || (!selectedVariant && (!product?.variants || product.variants.length === 0 || product.variants[0].quantity < 1))}
              >
                {isAddingToCart ? (
                  <><div className="w-4 h-4 border-2 border-[#FDF6E3] border-t-transparent rounded-full animate-spin" /> Adding...</>
                ) : (
                  <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                )}
              </button>

         

              {/* Wishlist */}
              <button
                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isInWishlist
                  ? "bg-[#C9933A]/10 border-[#C9933A] text-[#C9933A]"
                  : "bg-white border-[#C9933A]/40 text-[#3F1F00] hover:border-[#C9933A] hover:text-[#C9933A]"
                  }`}
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Trust mini badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Truck className="w-3.5 h-3.5" />, text: "Free Delivery" },
                { icon: <RefreshCw className="w-3.5 h-3.5" />, text: "Easy Returns" },
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: "Lab Certified" },
                { icon: <Leaf className="w-3.5 h-3.5" />, text: "100% Pure" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-[#C9933A]/20">
                  <span className="text-[#C9933A]">{badge.icon}</span>
                  <span className="font-sans text-[11px] font-medium text-[#3F1F00]/70">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Delivery info */}
            <div className="bg-white rounded-lg p-5 border border-[#C9933A]/20">
              <h4 className="font-playfair font-semibold text-[#3F1F00] text-base mb-3">Delivery Information</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-[#C9933A] flex-shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-[#5C3A1E]">Free shipping on orders above ₹999. Standard delivery in 3–5 business days.</span>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-4 h-4 text-[#C9933A] flex-shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-[#5C3A1E]">30-day easy return policy. Initiate from your account.</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#C9933A] flex-shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-[#5C3A1E]">100% authentic, lab-tested A2 cow ghee.</span>
                </div>
              </div>
            </div>

            {/* Product Metadata (SKU, Category) */}
            {(selectedVariant?.sku || product.category) && (
              <div className="border-t border-[#C9933A]/15 pt-4 space-y-2 text-sm">
                {selectedVariant?.sku && (
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs text-[#7A4E2D] w-20">SKU</span>
                    <span className="font-sans text-xs text-[#5C3A1E]">{selectedVariant.sku}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs text-[#7A4E2D] w-20">Category</span>
                    <Link href={`/category/${product.category?.slug}`} className="font-sans text-xs text-[#C9933A] hover:underline">
                      {product.category?.name}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS SECTION ── */}
      <div id="reviews" className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pb-16">
        <div className="bg-white rounded-xl overflow-hidden border border-[#C9933A]/15 shadow-sm">
          {/* Tab Nav */}
          <div className="flex border-b border-[#C9933A]/15 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-7 py-4 font-sans text-sm font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${activeTab === tab.id
                  ? "text-[#3F1F00] font-semibold border-b-2 border-[#C9933A] bg-[#FDF6E3]/50"
                  : "text-[#3F1F00]/50 hover:text-[#3F1F00]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="max-w-3xl">
                <div
                  className="font-sans text-base text-[#3F1F00] leading-relaxed prose prose-p:mb-4"
                  dangerouslySetInnerHTML={{ __html: product.description || "" }}
                />
                {product.directions && (
                  <div className="mt-8 p-6 bg-[#FDF6E3] rounded-lg border border-[#C9933A]/20">
                    <h3 className="font-playfair text-xl font-semibold text-[#3F1F00] mb-4">Directions for Use</h3>
                    <div className="space-y-4">
                      {product.directions.split('\n').filter(Boolean).map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-9 h-9 rounded-full bg-[#C9933A] text-[#3F1F00] font-cormorant text-lg font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="font-sans text-sm text-[#5C3A1E] mt-1.5">{step}</p>
                        </div>
                      ))}
                      {!product.directions.includes('\n') && (
                        <p className="font-sans text-sm text-[#5C3A1E] leading-relaxed">{product.directions}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && <ReviewSection product={product} />}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl">
                <div>
                  <h3 className="font-playfair font-semibold text-[#3F1F00] text-xl mb-5">Shipping Information</h3>
                  <ul className="space-y-4">
                    {[
                      { label: "Delivery Time", value: "3–5 business days (standard shipping)" },
                      { label: "Free Shipping", value: "Free shipping on all orders above ₹999" },
                      { label: "Express Delivery", value: "1–2 business days (₹199 extra)" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 pb-4 border-b border-[#C9933A]/10">
                        <ChevronRight className="w-4 h-4 text-[#C9933A] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-sans text-sm font-semibold text-[#3F1F00] mb-0.5">{item.label}</p>
                          <p className="font-sans text-sm text-[#5C3A1E]">{item.value}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-playfair font-semibold text-[#3F1F00] text-xl mb-5">Return Policy</h3>
                  <ul className="space-y-4">
                    {[
                      { label: "Return Window", value: "30 days from the date of delivery" },
                      { label: "Condition", value: "Product must be unused and in original packaging" },
                      { label: "Process", value: "Initiate return from your account and we'll arrange pickup" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 pb-4 border-b border-[#C9933A]/10">
                        <ChevronRight className="w-4 h-4 text-[#C9933A] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-sans text-sm font-semibold text-[#3F1F00] mb-0.5">{item.label}</p>
                          <p className="font-sans text-sm text-[#5C3A1E]">{item.value}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-gradient-to-b from-[#FDF6E3] to-[#FEF9F0] border-t border-[#C9933A]/15 py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="section-eyebrow">Explore More</span>
                <h2 className="font-cormorant text-4xl md:text-5xl font-semibold text-[#3F1F00] mt-1 leading-tight">
                  You May Also Like
                </h2>
                <div className="w-14 h-0.5 bg-gradient-to-r from-[#C9933A] to-transparent mt-4" />
              </div>
              <p className="text-sm text-[#8B6040] font-medium pb-1 hidden sm:block">
                {relatedProducts.length} related product{relatedProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
