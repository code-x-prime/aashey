import crypto from "crypto";
import Razorpay from "razorpay";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import { getOrderConfirmationTemplate } from "../email/temp/EmailTemplate.js";
import { processOrderForShipping } from "../utils/shiprocket.js";
import { decrypt } from "../utils/encryption.js";
import { getStoreConfig } from "../utils/storeConfig.js";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function getPaymentGatewayConfig(gateway = "RAZORPAY") {
  const paymentSettings = await prisma.paymentGatewaySetting.findFirst({
    where: { gateway: gateway.toUpperCase(), isActive: true },
  });

  if (!paymentSettings || !paymentSettings.isActive) {
    throw new ApiError(
      400,
      `Payment gateway ${gateway} is not configured or not active.`
    );
  }

  if (gateway.toUpperCase() === "RAZORPAY") {
    if (!paymentSettings.razorpayKeyId || !paymentSettings.razorpayKeySecret) {
      throw new ApiError(400, "Razorpay keys are not configured.");
    }

    let decryptedSecret;
    try {
      decryptedSecret = decrypt(paymentSettings.razorpayKeySecret);
      if (!decryptedSecret || !decryptedSecret.trim()) {
        throw new Error("Empty secret after decryption");
      }
    } catch (e) {
      throw new ApiError(400, "Failed to decrypt Razorpay key secret.");
    }

    const razorpayInstance = new Razorpay({
      key_id: paymentSettings.razorpayKeyId,
      key_secret: decryptedSecret,
    });

    return {
      razorpayInstance,
      paymentSettings: {
        gateway: paymentSettings.gateway,
        mode: paymentSettings.mode,
        userId: paymentSettings.userId,
        razorpayKeyId: paymentSettings.razorpayKeyId,
        razorpayKeySecret: decryptedSecret,
      },
    };
  }

  return {
    razorpayInstance: null,
    paymentSettings: {
      gateway: paymentSettings.gateway,
      mode: paymentSettings.mode,
      userId: paymentSettings.userId,
    },
  };
}

function validateGuestAddress(address) {
  const { name, email, phone, street, city, state, postalCode } = address || {};

  if (!name || name.trim().length < 2)
    throw new ApiError(400, "Name must be at least 2 characters");
  if (!email || !email.includes("@"))
    throw new ApiError(400, "Valid email is required");
  if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, "")))
    throw new ApiError(400, "Valid 10-digit phone number is required");
  if (!street) throw new ApiError(400, "Street address is required");
  if (!city) throw new ApiError(400, "City is required");
  if (!state) throw new ApiError(400, "State is required");
  if (!postalCode || !/^\d{6}$/.test(postalCode))
    throw new ApiError(400, "Valid 6-digit postal code is required");
}

function calculateSlabPrice(variant, quantity) {
  const qty = parseInt(quantity);

  if (variant.pricingSlabs?.length > 0) {
    const match = variant.pricingSlabs.find(
      (s) => qty >= s.minQty && (s.maxQty === null || qty <= s.maxQty)
    );
    if (match) return parseFloat(match.price);
  }

  if (variant.product?.pricingSlabs?.length > 0) {
    const match = variant.product.pricingSlabs.find(
      (s) => qty >= s.minQty && (s.maxQty === null || qty <= s.maxQty)
    );
    if (match) return parseFloat(match.price);
  }

  return parseFloat(variant.salePrice || variant.price);
}

async function fetchAndValidateCartItems(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new ApiError(400, "Cart items are required");
  }

  const variantIds = cartItems.map((item) => item.productVariantId);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          pricingSlabs: { orderBy: { minQty: "desc" } },
        },
      },
      attributes: {
        include: {
          attributeValue: { include: { attribute: true } },
        },
      },
      pricingSlabs: { orderBy: { minQty: "desc" } },
    },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  const processedItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const variant = variantMap.get(item.productVariantId);
    if (!variant) {
      throw new ApiError(400, `Product not found: ${item.productVariantId}`);
    }
    if (variant.quantity < item.quantity) {
      throw new ApiError(
        400,
        `Not enough stock for ${variant.product.name}`
      );
    }

    const price = calculateSlabPrice(variant, item.quantity);
    const itemSubtotal = price * item.quantity;
    subTotal += itemSubtotal;

    processedItems.push({
      variant,
      price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  return { processedItems, subTotal };
}

async function calculateShipping(subTotal) {
  const shiprocketSettings = await prisma.shiprocketSettings.findFirst();
  if (!shiprocketSettings) return 0;

  const threshold = parseFloat(shiprocketSettings.freeShippingThreshold || 0);
  const charge = parseFloat(shiprocketSettings.shippingCharge || 0);
  return threshold > 0 && subTotal >= threshold ? 0 : charge;
}

// Creates a new user from guest address data.
// Returns the new user or throws 409 if email already exists.
async function createGuestUser(guestAddress) {
  const { name, email, phone } = guestAddress;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new ApiError(
      409,
      "An account with this email already exists. Please log in to continue."
    );
  }

  const randomPassword = crypto.randomBytes(10).toString("hex");
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const generateCode = (id) => {
    const shortId = id.slice(-6).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `REF${shortId}${rand}`;
  };

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || "",
        otpVerified: false,
      },
    });

    let referralCode = generateCode(user.id);
    let codeExists = true;
    while (codeExists) {
      const taken = await tx.user.findUnique({ where: { referralCode } });
      if (!taken) {
        codeExists = false;
      } else {
        referralCode = generateCode(user.id + Date.now());
      }
    }

    return tx.user.update({
      where: { id: user.id },
      data: { referralCode },
    });
  });

  return newUser;
}

async function createUserAddress(userId, guestAddress) {
  const {
    name,
    phone,
    street,
    city,
    state,
    postalCode,
    country = "India",
  } = guestAddress;

  return prisma.address.create({
    data: {
      userId,
      name: name.trim(),
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: true,
    },
  });
}

function mapPaymentMethod(method) {
  const map = { card: "CARD", netbanking: "NETBANKING", wallet: "WALLET", upi: "UPI", emi: "EMI" };
  return map[method] || "OTHER";
}

async function notifyAdminNewOrder(orderId) {
  try {
    const storeConfig = getStoreConfig();
    const adminEmail = process.env.ADMIN_EMAIL || storeConfig.storeEmail;
    if (!adminEmail) return;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
    if (!order) return;

    const itemRows = order.items.map(i =>
      `<tr><td style="padding:4px 8px">${i.product?.name || "Product"}</td><td style="padding:4px 8px;text-align:center">${i.quantity}</td><td style="padding:4px 8px;text-align:right">₹${parseFloat(i.price).toFixed(2)}</td></tr>`
    ).join("");

    const customerName = order.user?.name || "Guest";
    const customerEmail = order.user?.email || "";
    const total = parseFloat(order.total).toFixed(2);
    const paymentMethod = order.paymentMethod === "CASH" ? "Cash on Delivery" : "Online Payment";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#3F1F00">🛒 New Order (Guest) — #${order.orderNumber}</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:4px 8px;color:#666">Customer</td><td style="padding:4px 8px"><strong>${customerName}</strong> (${customerEmail})</td></tr>
          <tr><td style="padding:4px 8px;color:#666">Payment</td><td style="padding:4px 8px">${paymentMethod}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">Total</td><td style="padding:4px 8px"><strong>₹${total}</strong></td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee">
          <thead><tr style="background:#f5f5f5"><th style="padding:6px 8px;text-align:left">Item</th><th style="padding:6px 8px">Qty</th><th style="padding:6px 8px;text-align:right">Price</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="color:#666;font-size:12px;margin-top:16px">Log in to the admin panel to manage this order.</p>
      </div>`;

    await sendEmail({
      email: adminEmail,
      subject: `[${storeConfig.storeName}] New Guest Order #${order.orderNumber} — ₹${total}`,
      html,
    });
  } catch (err) {
    console.error("Admin guest order notification error:", err);
  }
}

async function sendOrderConfirmationEmail(user, order, processedItems, address, paymentMethodLabel) {
  try {
    const emailItems = processedItems.map(({ variant, price, quantity }) => ({
      name: variant.product.name,
      variant: variant.attributes
        ?.map(
          (a) =>
            `${a.attributeValue?.attribute?.name}: ${a.attributeValue?.value}`
        )
        .filter(Boolean)
        .join(", ") || "",
      quantity,
      price: price.toFixed(2),
    }));

    await sendEmail({
      email: user.email,
      subject: `Order Confirmed — #${order.orderNumber}`,
      html: getOrderConfirmationTemplate({
        userName: user.name || "Valued Customer",
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        paymentMethod: paymentMethodLabel,
        items: emailItems,
        subtotal: parseFloat(order.subTotal).toFixed(2),
        shipping: parseFloat(order.shippingCost || 0).toFixed(2),
        tax: "0.00",
        discount: parseFloat(order.discount || 0).toFixed(2),
        couponCode: order.couponCode || "",
        total: parseFloat(order.total).toFixed(2),
        shippingAddress: address,
      }),
    });
  } catch (emailError) {
    console.error("Guest order confirmation email error:", emailError);
  }
}

async function incrementCouponUsed(couponId) {
  if (!couponId) return;
  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  } catch (e) {
    console.warn("Failed to update coupon used count:", e);
  }
}

// ---------------------------------------------------------------------------
// Exported handlers
// ---------------------------------------------------------------------------

// GET /payment/guest/razorpay-key  (public)
export const getGuestRazorpayKey = asyncHandler(async (req, res) => {
  const paymentConfig = await getPaymentGatewayConfig("RAZORPAY");

  res.status(200).json(
    new ApiResponsive(
      200,
      { key: paymentConfig.paymentSettings.razorpayKeyId },
      "Razorpay key fetched"
    )
  );
});

// POST /payment/guest/checkout  (public) — create Razorpay order
export const createGuestRazorpayOrder = asyncHandler(async (req, res) => {
  const {
    guestAddress,
    cartItems,
    couponCode,
    couponId,
    discountAmount,
    currency = "INR",
  } = req.body;

  validateGuestAddress(guestAddress);

  // Check email uniqueness before creating the Razorpay order
  const normalizedEmail = guestAddress.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new ApiError(
      409,
      "An account with this email already exists. Please log in to continue."
    );
  }

  // Validate payment enabled
  const paymentSettingsRow = await prisma.paymentSettings.findFirst();
  if (!paymentSettingsRow?.razorpayEnabled) {
    throw new ApiError(400, "Online payment is not enabled");
  }

  const { processedItems, subTotal } = await fetchAndValidateCartItems(cartItems);
  const shippingCost = await calculateShipping(subTotal);
  const discount = Math.max(parseFloat(discountAmount) || 0, 0);
  const totalAmount = Math.max(subTotal + shippingCost - discount, 1);
  const amountInPaise = Math.round(parseFloat(totalAmount.toFixed(2)) * 100);

  const paymentConfig = await getPaymentGatewayConfig("RAZORPAY");

  const timestamp = Date.now().toString().slice(-10);
  const receipt = `g_${timestamp}`;

  const notes = {};
  if (couponCode) notes.couponCode = couponCode;
  if (couponId) notes.couponId = couponId;
  if (discount > 0) notes.discountAmount = discount;

  const razorpayOrder = await paymentConfig.razorpayInstance.orders.create({
    amount: amountInPaise,
    currency,
    receipt,
    notes: Object.keys(notes).length > 0 ? notes : undefined,
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        ...razorpayOrder,
        razorpayKey: paymentConfig.paymentSettings.razorpayKeyId,
      },
      "Guest Razorpay order created"
    )
  );
});

// POST /payment/guest/verify  (public) — verify payment → create user + order
export const verifyGuestPayment = asyncHandler(async (req, res) => {
  const razorpay_order_id =
    req.body.razorpay_order_id || req.body.razorpayOrderId;
  const razorpay_payment_id =
    req.body.razorpay_payment_id || req.body.razorpayPaymentId;
  const razorpay_signature =
    req.body.razorpay_signature || req.body.razorpaySignature;

  const { guestAddress, cartItems, couponCode, couponId, discountAmount } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment details");
  }

  validateGuestAddress(guestAddress);

  const paymentConfig = await getPaymentGatewayConfig("RAZORPAY");

  // Verify Razorpay signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", paymentConfig.paymentSettings.razorpayKeySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  // Prevent duplicate processing
  const existingPayment = await prisma.razorpayPayment.findUnique({
    where: { razorpayPaymentId: razorpay_payment_id },
  });
  if (existingPayment) throw new ApiError(400, "Payment already processed");

  const { processedItems, subTotal } = await fetchAndValidateCartItems(cartItems);
  const shippingCost = await calculateShipping(subTotal);
  const discount = Math.max(parseFloat(discountAmount) || 0, 0);

  // Fetch Razorpay payment details for method mapping
  const razorpayPaymentDetails =
    await paymentConfig.razorpayInstance.payments.fetch(razorpay_payment_id);

  // Create user + address
  const newUser = await createGuestUser(guestAddress);
  const address = await createUserAddress(newUser.id, guestAddress);

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: newUser.id,
        subTotal: subTotal.toFixed(2),
        tax: "0.00",
        shippingCost: shippingCost.toFixed(2),
        discount: discount || 0,
        total: (subTotal + shippingCost - discount).toFixed(2),
        paymentMethod: "RAZORPAY",
        paymentGateway: "RAZORPAY",
        paymentMode: paymentConfig.paymentSettings.mode,
        paymentOwnerId: paymentConfig.paymentSettings.userId,
        shippingAddressId: address.id,
        billingAddressSameAsShipping: true,
        status: "PAID",
        couponCode: couponCode || null,
        couponId: couponId || null,
      },
    });

    const payment = await tx.razorpayPayment.create({
      data: {
        orderId: order.id,
        amount: (subTotal + shippingCost - discount).toFixed(2),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "CAPTURED",
        paymentMethod: mapPaymentMethod(razorpayPaymentDetails.method),
        notes: razorpayPaymentDetails,
      },
    });

    for (const { variant, price, quantity, subtotal } of processedItems) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: variant.product.id,
          variantId: variant.id,
          price,
          originalPrice: variant.price,
          quantity,
          subtotal,
        },
      });

      await tx.productVariant.update({
        where: { id: variant.id },
        data: { quantity: { decrement: quantity } },
      });

      await tx.inventoryLog.create({
        data: {
          variantId: variant.id,
          quantityChange: -quantity,
          reason: "sale",
          referenceId: order.id,
          previousQuantity: variant.quantity,
          newQuantity: variant.quantity - quantity,
          createdBy: newUser.id,
        },
      });
    }

    return { order, payment };
  });

  await incrementCouponUsed(couponId);
  await sendOrderConfirmationEmail(
    newUser,
    result.order,
    processedItems,
    address,
    "Online Payment"
  );
  notifyAdminNewOrder(result.order.id).catch(console.error);

  processOrderForShipping(result.order.id).catch((err) => {
    console.error("Shiprocket error for guest Razorpay order:", err);
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        paymentId: result.payment.id,
      },
      "Guest payment verified and order created"
    )
  );
});

// POST /payment/guest/cash-order  (public) — create COD order
export const createGuestCashOrder = asyncHandler(async (req, res) => {
  const { guestAddress, cartItems, couponCode, couponId, discountAmount } =
    req.body;

  validateGuestAddress(guestAddress);

  const paymentSettingsRow = await prisma.paymentSettings.findFirst();
  if (!paymentSettingsRow?.cashEnabled) {
    throw new ApiError(400, "Cash on Delivery is not enabled");
  }

  const { processedItems, subTotal } = await fetchAndValidateCartItems(cartItems);
  const shippingCost = await calculateShipping(subTotal);
  const codCharge = parseFloat(paymentSettingsRow.codCharge) || 0;
  const discount = Math.max(parseFloat(discountAmount) || 0, 0);

  // Create user + address
  const newUser = await createGuestUser(guestAddress);
  const address = await createUserAddress(newUser.id, guestAddress);

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: newUser.id,
        subTotal: subTotal.toFixed(2),
        tax: "0.00",
        shippingCost: shippingCost.toFixed(2),
        discount: discount || 0,
        codCharge: codCharge.toFixed(2),
        total: (subTotal + shippingCost + codCharge - discount).toFixed(2),
        paymentMethod: "CASH",
        shippingAddressId: address.id,
        billingAddressSameAsShipping: true,
        status: "PENDING",
        couponCode: couponCode || null,
        couponId: couponId || null,
      },
    });

    for (const { variant, price, quantity, subtotal } of processedItems) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: variant.product.id,
          variantId: variant.id,
          price,
          originalPrice: variant.price,
          quantity,
          subtotal,
        },
      });

      await tx.productVariant.update({
        where: { id: variant.id },
        data: { quantity: { decrement: quantity } },
      });

      await tx.inventoryLog.create({
        data: {
          variantId: variant.id,
          quantityChange: -quantity,
          reason: "sale",
          referenceId: order.id,
          previousQuantity: variant.quantity,
          newQuantity: variant.quantity - quantity,
          createdBy: newUser.id,
        },
      });
    }

    return { order };
  });

  await incrementCouponUsed(couponId);
  await sendOrderConfirmationEmail(
    newUser,
    result.order,
    processedItems,
    address,
    "Cash on Delivery"
  );
  notifyAdminNewOrder(result.order.id).catch(console.error);

  processOrderForShipping(result.order.id).catch((err) => {
    console.error("Shiprocket error for guest COD order:", err);
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        paymentMethod: "CASH",
      },
      "Guest cash order created successfully"
    )
  );
});
