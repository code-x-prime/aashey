import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { getFileUrl } from "../utils/deleteFromS3.js";
import { formatVariantWithAttributes } from "../utils/variant-attributes.js";

// Get user's cart
export const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get cart items with product and variant details
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      productVariant: {
        include: {
          product: {
            include: {
              images: true,
              brand: true,
              categories: {
                include: {
                  category: true,
                },
              },
            },
          },
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },
          images: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate cart totals
  let subtotal = 0;
  const formattedItems = await Promise.all(
    cartItems.map(async (item) => {
      const variant = item.productVariant;

      // Get effective MOQ for this variant
      let effectiveMOQ = 1;
      let moqSource = "DEFAULT";

      // Check variant MOQ
      const variantMOQ = await prisma.mOQSetting.findFirst({
        where: {
          scope: "VARIANT",
          variantId: variant.id,
          isActive: true,
        },
      });

      if (variantMOQ) {
        effectiveMOQ = variantMOQ.minQuantity;
        moqSource = "VARIANT";
      } else {
        // Check product MOQ
        const productMOQ = await prisma.mOQSetting.findFirst({
          where: {
            scope: "PRODUCT",
            productId: variant.productId,
            isActive: true,
          },
        });

        if (productMOQ) {
          effectiveMOQ = productMOQ.minQuantity;
          moqSource = "PRODUCT";
        } else {
          // Check global MOQ
          const globalMOQ = await prisma.mOQSetting.findFirst({
            where: {
              scope: "GLOBAL",
              isActive: true,
            },
          });

          if (globalMOQ) {
            effectiveMOQ = globalMOQ.minQuantity;
            moqSource = "GLOBAL";
          }
        }
      }

      // Get pricing slabs for this variant
      const variantSlabs = await prisma.pricingSlab.findMany({
        where: {
          variantId: variant.id,
        },
        orderBy: {
          minQty: "asc",
        },
      });

      // Get product-level pricing slabs
      const productSlabs = await prisma.pricingSlab.findMany({
        where: {
          productId: variant.productId,
          variantId: null,
        },
        orderBy: {
          minQty: "asc",
        },
      });

      // Combine slabs (variant slabs override product slabs)
      const allSlabs = [...variantSlabs, ...productSlabs].sort((a, b) => a.minQty - b.minQty);

      // Get effective price based on quantity
      let effectivePrice = parseFloat(variant.salePrice || variant.price);
      let priceSource = "DEFAULT";
      let appliedSlab = null;

      // Find matching pricing slab
      for (const slab of allSlabs) {
        if (item.quantity >= slab.minQty && (slab.maxQty === null || item.quantity <= slab.maxQty)) {
          effectivePrice = parseFloat(slab.price);
          priceSource = slab.variantId ? "VARIANT_SLAB" : "PRODUCT_SLAB";
          appliedSlab = {
            id: slab.id,
            minQty: slab.minQty,
            maxQty: slab.maxQty,
            price: parseFloat(slab.price),
          };
          break; // Use first matching slab (highest priority)
        }
      }

      // Check for active flash sale for this product
      const now = new Date();
      const flashSaleProduct = await prisma.flashSaleProduct.findFirst({
        where: {
          productId: variant.productId,
          flashSale: {
            isActive: true,
            startTime: { lte: now },
            endTime: { gte: now },
          },
        },
        include: {
          flashSale: {
            select: {
              id: true,
              name: true,
              discountPercentage: true,
              endTime: true,
            },
          },
        },
      });

      // Apply flash sale discount if applicable
      let flashSaleInfo = null;
      let priceBeforeFlashSale = effectivePrice;

      if (flashSaleProduct) {
        const discountAmount = (effectivePrice * flashSaleProduct.flashSale.discountPercentage) / 100;
        effectivePrice = Math.round((effectivePrice - discountAmount) * 100) / 100;
        priceSource = "FLASH_SALE";
        flashSaleInfo = {
          flashSaleId: flashSaleProduct.flashSale.id,
          name: flashSaleProduct.flashSale.name,
          discountPercentage: flashSaleProduct.flashSale.discountPercentage,
          endTime: flashSaleProduct.flashSale.endTime,
          originalPrice: priceBeforeFlashSale,
        };
      }

      const itemTotal = effectivePrice * item.quantity;
      subtotal += itemTotal;

      // Enhanced image handling with fallback logic
      let imageUrl = null;

      // Priority 1: Variant images
      if (variant.images && variant.images.length > 0) {
        const primaryImage = variant.images.find((img) => img.isPrimary);
        imageUrl = primaryImage ? primaryImage.url : variant.images[0].url;
      }
      // Priority 2: Product images
      else if (variant.product.images && variant.product.images.length > 0) {
        const primaryImage = variant.product.images.find((img) => img.isPrimary);
        imageUrl = primaryImage
          ? primaryImage.url
          : variant.product.images[0].url;
      }

      // Format the response
      return {
        id: item.id,
        quantity: item.quantity,
        price: effectivePrice,
        originalPrice: parseFloat(variant.price),
        subtotal: itemTotal,
        moq: effectiveMOQ,
        moqSource,
        pricingSlabs: allSlabs.map((slab) => ({
          id: slab.id,
          minQty: slab.minQty,
          maxQty: slab.maxQty,
          price: parseFloat(slab.price),
        })),
        appliedSlab,
        priceSource,
        variant: {
          id: variant.id,
          sku: variant.sku,
          attributes: formatVariantWithAttributes(variant).attributes,
          shippingLength: variant.shippingLength,
          shippingBreadth: variant.shippingBreadth,
          shippingHeight: variant.shippingHeight,
          shippingWeight: variant.shippingWeight,
          images: (variant.images || []).map((img) => ({
            url: getFileUrl(img.url),
            isPrimary: img.isPrimary,
            order: img.order ?? 0,
          })),
        },
        product: {
          id: variant.product.id,
          name: variant.product.name,
          slug: variant.product.slug,
          image: imageUrl ? getFileUrl(imageUrl) : null,
          images: (variant.product.images || []).map((img) => ({
            url: getFileUrl(img.url),
            isPrimary: img.isPrimary,
            order: img.order ?? 0,
          })),
          brand: variant.product.brand
            ? {
              id: variant.product.brand.id,
              name: variant.product.brand.name,
            }
            : null,
          brandId: variant.product.brandId,
          categories: (variant.product.categories || []).map((pc) => ({
            id: pc.categoryId,
            name: pc.category?.name,
          })),
        },
        flashSale: flashSaleInfo,
      };
    })
  );

  // Calculate shipping
  let shippingTotal = 0;
  let freeShippingThreshold = 0;
  let shippingMessage = "";

  const shiprocketSettings = await prisma.shiprocketSettings.findFirst();

  if (shiprocketSettings) {
    const charge = parseFloat(shiprocketSettings.shippingCharge) || 0;
    // Only set threshold if there is a charge, otherwise it's always free (threshold irrelevant)
    freeShippingThreshold = charge > 0 ? (parseFloat(shiprocketSettings.freeShippingThreshold) || 0) : 0;

    if (charge > 0) {
      if (freeShippingThreshold > 0) {
        if (subtotal >= freeShippingThreshold) {
          shippingTotal = 0;
          shippingMessage = "Eligible for Free Shipping";
        } else {
          shippingTotal = charge;
          // Format message in frontend usually, but providing data here helps
          shippingMessage = "Add more for free shipping";
        }
      } else {
        shippingTotal = charge;
      }
    } else {
      shippingTotal = 0;
      shippingMessage = "Free Shipping";
    }
  }

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        items: formattedItems,
        subtotal,
        shippingTotal,
        freeShippingThreshold,
        shippingMessage,
        grandTotal: subtotal + shippingTotal,
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
      "Cart fetched successfully"
    )
  );
});

// Get shipping options for cart (public endpoint for checkout)
export const getShippingOptions = asyncHandler(async (req, res) => {
  const { deliveryPincode, pickupPincode, cartItems: guestCartItems } = req.body;

  if (!deliveryPincode) {
    throw new ApiError(400, "Delivery pincode is required");
  }

  // Get user's cart (if authenticated) or guest cart from request body
  let cartItems = [];
  let userId = null;

  if (req.user?.id) {
    userId = req.user.id;
    cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },
    });
  } else {
    if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      throw new ApiError(400, "Guest cart items are required for shipping options");
    }

    const variantIds = guestCartItems
      .map((item) => item.productVariantId)
      .filter(Boolean);

    if (!variantIds.length) {
      throw new ApiError(400, "Guest cart item variant IDs are required");
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: true,
      },
    });

    cartItems = guestCartItems.map((item) => {
      const variant = variants.find((variant) => variant.id === item.productVariantId);
      if (!variant) {
        throw new ApiError(400, `Product variant not found: ${item.productVariantId}`);
      }
      return {
        quantity: item.quantity,
        productVariant: variant,
      };
    });
  }

  if (!cartItems.length) {
    throw new ApiError(400, "No items in cart");
  }

  // Calculate total weight
  let totalWeight = 0;
  for (const item of cartItems) {
    const variant = item.productVariant;
    const weight = variant.shippingWeight || 0.5; // Default 0.5kg if not set
    totalWeight += weight * item.quantity;
  }

  // Shiprocket must be enabled and configured
  const shiprocketSettings = await prisma.shiprocketSettings.findFirst();
  if (!shiprocketSettings?.isEnabled) {
    throw new ApiError(400, "Shipping options are not available. Please contact support.");
  }

  // Get pickup pincode from default warehouse
  let finalPickupPincode = pickupPincode;
  if (!finalPickupPincode) {
    const defaultPickup = await prisma.shiprocketPickupAddress.findFirst({
      where: { isDefault: true },
    });
    if (defaultPickup) {
      finalPickupPincode = defaultPickup.pincode;
    } else {
      throw new ApiError(400, "No pickup address configured. Please contact support.");
    }
  }

  // Check serviceability with Shiprocket
  const { checkServiceability } = await import("../utils/shiprocket.js");

  try {
    const serviceabilityData = await checkServiceability({
      pickupPincode: finalPickupPincode,
      deliveryPincode,
      weight: Math.max(totalWeight, 0.5), // Minimum 0.5kg
      cod: false, // We'll handle COD separately
    });

    // Format the response
    const shippingOptions = [];

    if (serviceabilityData && serviceabilityData.data && Array.isArray(serviceabilityData.data.available_courier_companies)) {
      for (const courier of serviceabilityData.data.available_courier_companies) {
        shippingOptions.push({
          id: courier.courier_company_id,
          name: courier.courier_name,
          rate: parseFloat(courier.rate),
          etd: courier.etd || "2-3 days", // Estimated delivery time
          pickupAvailable: courier.pickup_available || false,
          codAvailable: courier.cod === 1,
          description: `${courier.courier_name} - ₹${courier.rate} (${courier.etd || "2-3 days"})`,
        });
      }
    }

    // Sort by rate (cheapest first)
    shippingOptions.sort((a, b) => a.rate - b.rate);

    res.status(200).json(
      new ApiResponsive(
        200,
        {
          shippingOptions,
          totalWeight,
          pickupPincode: finalPickupPincode,
          deliveryPincode,
        },
        "Shipping options fetched successfully"
      )
    );
  } catch (error) {
    console.error("Shiprocket serviceability error:", error);
    throw new ApiError(400, `Unable to fetch shipping options: ${error.message}`);
  }
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productVariantId, quantity = 1 } = req.body;

  if (!productVariantId) {
    throw new ApiError(400, "Product variant ID is required");
  }

  // Validate quantity
  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // Check if product variant exists and is active
  const productVariant = await prisma.productVariant.findFirst({
    where: {
      id: productVariantId,
      isActive: true,
      product: {
        isActive: true,
      },
    },
    include: {
      product: true,
    },
  });

  if (!productVariant) {
    throw new ApiError(404, "Product variant not found or inactive");
  }

  // Check stock availability
  if (productVariant.quantity < quantity) {
    throw new ApiError(400, "Not enough stock available");
  }

  // Check MOQ (Minimum Order Quantity)
  let effectiveMOQ = 1;

  // Check variant MOQ
  const variantMOQ = await prisma.mOQSetting.findFirst({
    where: {
      scope: "VARIANT",
      variantId: productVariantId,
      isActive: true,
    },
  });

  if (variantMOQ) {
    effectiveMOQ = variantMOQ.minQuantity;
  } else {
    // Check product MOQ
    const productMOQ = await prisma.mOQSetting.findFirst({
      where: {
        scope: "PRODUCT",
        productId: productVariant.productId,
        isActive: true,
      },
    });

    if (productMOQ) {
      effectiveMOQ = productMOQ.minQuantity;
    } else {
      // Check global MOQ
      const globalMOQ = await prisma.mOQSetting.findFirst({
        where: {
          scope: "GLOBAL",
          isActive: true,
        },
      });

      if (globalMOQ) {
        effectiveMOQ = globalMOQ.minQuantity;
      }
    }
  }

  // Validate quantity meets MOQ
  if (quantity < effectiveMOQ) {
    throw new ApiError(400, `Minimum order quantity is ${effectiveMOQ} units`);
  }

  // Check if item already exists in cart
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productVariantId: {
        userId,
        productVariantId,
      },
    },
  });

  let cartItem;

  if (existingCartItem) {
    // Update quantity if item already exists
    const newQuantity = existingCartItem.quantity + parseInt(quantity);

    // Recheck stock with new quantity
    if (productVariant.quantity < newQuantity) {
      throw new ApiError(400, "Not enough stock available");
    }

    // Recheck MOQ with new quantity
    let effectiveMOQ = 1;
    const variantMOQ = await prisma.mOQSetting.findFirst({
      where: {
        scope: "VARIANT",
        variantId: productVariantId,
        isActive: true,
      },
    });

    if (variantMOQ) {
      effectiveMOQ = variantMOQ.minQuantity;
    } else {
      const productMOQ = await prisma.mOQSetting.findFirst({
        where: {
          scope: "PRODUCT",
          productId: productVariant.productId,
          isActive: true,
        },
      });

      if (productMOQ) {
        effectiveMOQ = productMOQ.minQuantity;
      } else {
        const globalMOQ = await prisma.mOQSetting.findFirst({
          where: {
            scope: "GLOBAL",
            isActive: true,
          },
        });

        if (globalMOQ) {
          effectiveMOQ = globalMOQ.minQuantity;
        }
      }
    }

    if (newQuantity < effectiveMOQ) {
      throw new ApiError(400, `Minimum order quantity is ${effectiveMOQ} units`);
    }

    cartItem = await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: newQuantity,
      },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            attributes: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
            images: true,
          },
        },
      },
    });
  } else {
    // Create new cart item
    cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productVariantId,
        quantity: parseInt(quantity),
      },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            attributes: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
            images: true,
          },
        },
      },
    });
  }

  return res
    .status(200)
    .json(new ApiResponsive(200, cartItem, "Item added to cart successfully"));
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // Check if cart item exists and belongs to user
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId,
    },
    include: {
      productVariant: true,
    },
  });

  if (!existingCartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  // Check stock availability
  if (existingCartItem.productVariant.quantity < quantity) {
    throw new ApiError(400, "Not enough stock available");
  }

  // Check MOQ (Minimum Order Quantity)
  let effectiveMOQ = 1;

  // Check variant MOQ
  const variantMOQ = await prisma.mOQSetting.findFirst({
    where: {
      scope: "VARIANT",
      variantId: existingCartItem.productVariantId,
      isActive: true,
    },
  });

  if (variantMOQ) {
    effectiveMOQ = variantMOQ.minQuantity;
  } else {
    // Check product MOQ
    const productMOQ = await prisma.mOQSetting.findFirst({
      where: {
        scope: "PRODUCT",
        productId: existingCartItem.productVariant.productId,
        isActive: true,
      },
    });

    if (productMOQ) {
      effectiveMOQ = productMOQ.minQuantity;
    } else {
      // Check global MOQ
      const globalMOQ = await prisma.mOQSetting.findFirst({
        where: {
          scope: "GLOBAL",
          isActive: true,
        },
      });

      if (globalMOQ) {
        effectiveMOQ = globalMOQ.minQuantity;
      }
    }
  }

  // Validate quantity meets MOQ
  if (quantity < effectiveMOQ) {
    throw new ApiError(400, `Minimum order quantity is ${effectiveMOQ} units`);
  }

  const updatedCartItem = await prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: {
      quantity: parseInt(quantity),
    },
    include: {
      productVariant: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Calculate effective price based on new quantity
  const variant = updatedCartItem.productVariant;
  let effectivePrice = parseFloat(variant.salePrice || variant.price);
  let priceSource = "DEFAULT";
  let appliedSlab = null;

  // Get pricing slabs
  const variantSlabs = await prisma.pricingSlab.findMany({
    where: {
      variantId: variant.id,
    },
    orderBy: {
      minQty: "asc",
    },
  });

  const productSlabs = await prisma.pricingSlab.findMany({
    where: {
      productId: variant.productId,
      variantId: null,
    },
    orderBy: {
      minQty: "asc",
    },
  });

  const allSlabs = [...variantSlabs, ...productSlabs].sort((a, b) => a.minQty - b.minQty);

  // Find matching pricing slab for the new quantity
  for (const slab of allSlabs) {
    if (parseInt(quantity) >= slab.minQty && (slab.maxQty === null || parseInt(quantity) <= slab.maxQty)) {
      effectivePrice = parseFloat(slab.price);
      priceSource = slab.variantId ? "VARIANT_SLAB" : "PRODUCT_SLAB";
      appliedSlab = {
        id: slab.id,
        minQty: slab.minQty,
        maxQty: slab.maxQty,
        price: parseFloat(slab.price),
      };
      break;
    }
  }

  const itemTotal = effectivePrice * parseInt(quantity);

  // Format response with effective price
  const formattedItem = {
    id: updatedCartItem.id,
    quantity: updatedCartItem.quantity,
    price: effectivePrice,
    originalPrice: parseFloat(variant.price),
    subtotal: itemTotal,
    priceSource,
    appliedSlab,
  };

  return res
    .status(200)
    .json(
      new ApiResponsive(200, formattedItem, "Cart item updated successfully")
    );
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { cartItemId } = req.params;

  // Check if cart item exists and belongs to user
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId,
    },
  });

  if (!existingCartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponsive(200, {}, "Item removed from cart successfully"));
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await prisma.cartItem.deleteMany({
    where: {
      userId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponsive(200, {}, "Cart cleared successfully"));
});
