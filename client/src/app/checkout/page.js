"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { fetchApi, formatCurrency, loadScript } from "@/lib/utils";
import { playSuccessSound, fireConfetti } from "@/lib/sound-utils";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    AlertCircle,
    Loader2,
    CheckCircle,
    MapPin,
    Plus,
    IndianRupee,
    ShoppingBag,
    PartyPopper,
    Gift,
    Wallet,
    Star,
    MessageSquare,
    User,
    LogIn,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AddressForm from "@/components/AddressForm";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUrl";



export default function CheckoutPage() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const { cart, coupon, getCartTotals, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState({
        cashEnabled: true,
        razorpayEnabled: false,
        codCharge: 0,
    });
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [processing, setProcessing] = useState(false);
    const [orderCreated, setOrderCreated] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [razorpayKey, setRazorpayKey] = useState("");
    const [error, setError] = useState("");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [successAnimation, setSuccessAnimation] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(2);
    const [confettiCannon, setConfettiCannon] = useState(false);
    const [orderItemsForReview, setOrderItemsForReview] = useState([]);
    const [isGuestOrder, setIsGuestOrder] = useState(false);

    // Guest address form state
    const [guestAddress, setGuestAddress] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
    });
    const [guestAddressErrors, setGuestAddressErrors] = useState({});

    const totals = getCartTotals();

    // Redirect if cart is empty (but not if order is already created)
    useEffect(() => {
        if (cart.items?.length === 0 && !orderCreated) {
            router.push("/cart");
        }
    }, [cart, router, orderCreated]);

    // Fetch payment settings
    useEffect(() => {
        const fetchPaymentSettings = async () => {
            try {
                const response = await fetchApi("/payment/settings", {
                    credentials: "include",
                });
                if (response.success) {
                    setPaymentSettings({
                        cashEnabled: response.data.cashEnabled ?? true,
                        razorpayEnabled: response.data.razorpayEnabled ?? false,
                        codCharge: response.data.codCharge ?? 0,
                    });
                    if (response.data.cashEnabled) {
                        setPaymentMethod("CASH");
                    } else if (response.data.razorpayEnabled) {
                        setPaymentMethod("RAZORPAY");
                    }
                }
            } catch (error) {
                console.error("Error fetching payment settings:", error);
                setPaymentMethod("CASH");
            }
        };
        fetchPaymentSettings();
    }, []);

    // Fetch saved addresses (authenticated users only)
    const fetchAddresses = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoadingAddresses(true);
        try {
            const response = await fetchApi("/users/addresses", {
                credentials: "include",
            });

            if (response.success) {
                setAddresses(response.data.addresses || []);

                if (response.data.addresses?.length > 0) {
                    const defaultAddress = response.data.addresses.find(
                        (addr) => addr.isDefault
                    );
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress.id);
                    } else {
                        setSelectedAddressId(response.data.addresses[0].id);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Failed to load your addresses");
        } finally {
            setLoadingAddresses(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // Fetch Razorpay key for authenticated users
    useEffect(() => {
        const fetchRazorpayKey = async () => {
            try {
                const response = await fetchApi("/payment/razorpay-key", {
                    credentials: "include",
                });
                if (response.success) {
                    setRazorpayKey(response.data.key);
                }
            } catch (error) {
                console.error("Error fetching Razorpay key:", error);
            }
        };

        if (isAuthenticated) {
            fetchRazorpayKey();
        }
    }, [isAuthenticated]);

    const handleAddressSelect = (id) => setSelectedAddressId(id);
    const handlePaymentMethodSelect = (method) => setPaymentMethod(method);

    const handleAddressFormSuccess = () => {
        setShowAddressForm(false);
        fetchAddresses();
    };

    // Guest address field change
    const handleGuestAddressChange = (e) => {
        const { name, value } = e.target;
        setGuestAddress((prev) => ({ ...prev, [name]: value }));
        if (guestAddressErrors[name]) {
            setGuestAddressErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Validate guest address form
    const validateGuestAddress = () => {
        const errors = {};
        if (!guestAddress.name || guestAddress.name.trim().length < 2)
            errors.name = "Name must be at least 2 characters";
        if (!guestAddress.email || !guestAddress.email.includes("@"))
            errors.email = "Valid email is required";
        if (!guestAddress.phone || !/^\d{10}$/.test(guestAddress.phone.replace(/\D/g, "")))
            errors.phone = "Valid 10-digit phone number is required";
        if (!guestAddress.street) errors.street = "Street address is required";
        if (!guestAddress.city) errors.city = "City is required";
        if (!guestAddress.state) errors.state = "State is required";
        if (!guestAddress.postalCode || !/^\d{6}$/.test(guestAddress.postalCode))
            errors.postalCode = "Valid 6-digit postal code is required";

        setGuestAddressErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Add countdown for redirect
    useEffect(() => {
        if (orderCreated && redirectCountdown > 0) {
            const timer = setTimeout(() => {
                setRedirectCountdown(redirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (orderCreated && redirectCountdown === 0) {
            if (isGuestOrder) {
                router.push("/");
            } else {
                router.push("/account/orders");
            }
        }
    }, [orderCreated, redirectCountdown, router, isGuestOrder]);

    // Enhanced confetti effect when order is successful
    useEffect(() => {
        if (successAnimation) {
            fireConfetti.celebration();
            const timer = setTimeout(() => {
                setConfettiCannon(true);
                fireConfetti.sides();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [successAnimation]);

    const handleSuccessfulPayment = (
        paymentResponse = null,
        orderData = null,
        guestCheckout = false
    ) => {
        if (paymentResponse?.razorpay_payment_id) {
            setPaymentId(paymentResponse.razorpay_payment_id);
        }
        if (orderData?.orderNumber) {
            setOrderNumber(orderData.orderNumber);
        }

        setSuccessAnimation(true);
        setIsGuestOrder(guestCheckout);
        playSuccessSound();

        const items = cart.items?.map((item) => ({
            productId: item.productId || item.product?.id,
            productName: item.productName || item.product?.name,
            productSlug: item.productSlug || item.product?.slug,
        }))?.filter((i) => i.productId && i.productSlug) || [];
        setOrderItemsForReview(items);

        clearCart();

        const orderNum = orderData?.orderNumber || orderNumber || "";
        toast.success("Order placed successfully!", {
            duration: 4000,
            icon: <PartyPopper className="h-5 w-5 text-green-500" />,
            description: orderNum
                ? `Your order #${orderNum} has been confirmed. ${guestCheckout ? "Check your email for details." : "Redirecting to orders page..."}`
                : "Your order has been confirmed.",
        });

        setTimeout(() => {
            setOrderCreated(true);
        }, 100);
    };

    // Build guest cart items payload for backend
    const buildGuestCartItems = () => {
        return cart.items.map((item) => ({
            productVariantId: item.productVariantId || item.variant?.id,
            quantity: item.quantity,
        }));
    };

    // Process checkout
    const handleCheckout = async () => {
        if (isAuthenticated) {
            // ---------- AUTHENTICATED USER FLOW ----------
            if (!selectedAddressId) {
                toast.error("Please select a shipping address");
                return;
            }

            setProcessing(true);
            setError("");

            try {
                const calculatedAmount = totals.total;
                const amount = Math.max(parseFloat(calculatedAmount.toFixed(2)), 1);

                if (calculatedAmount < 1) {
                    toast.info("Minimum order amount is ₹1. Your total has been adjusted.");
                }

                if (paymentMethod === "CASH") {
                    toast.loading("Creating your order...", {
                        id: "order-creation",
                        duration: 10000,
                    });

                    const orderResponse = await fetchApi("/payment/cash-order", {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            shippingAddressId: selectedAddressId,
                            billingAddressSameAsShipping: true,
                            couponCode: coupon?.code || null,
                            couponId: coupon?.id || null,
                            discountAmount: totals.discount || 0,
                        }),
                    });

                    toast.dismiss("order-creation");

                    if (!orderResponse.success) {
                        throw new Error(orderResponse.message || "Failed to create order");
                    }

                    const orderData = {
                        orderNumber: orderResponse.data.orderNumber,
                        orderId: orderResponse.data.orderId,
                        paymentMethod: orderResponse.data.paymentMethod || "CASH",
                    };
                    setOrderNumber(orderResponse.data.orderNumber);
                    setOrderId(orderResponse.data.orderId || "");
                    handleSuccessfulPayment(null, orderData, false);
                    return;

                } else if (paymentMethod === "RAZORPAY") {
                    let currentKey = razorpayKey;
                    if (!currentKey) {
                        try {
                            const keyResponse = await fetchApi("/payment/razorpay-key", {
                                credentials: "include",
                            });
                            if (keyResponse.success && keyResponse.data?.key) {
                                currentKey = keyResponse.data.key;
                                setRazorpayKey(currentKey);
                            } else {
                                throw new Error("Razorpay key not available.");
                            }
                        } catch {
                            throw new Error("Failed to fetch Razorpay key. Please configure payment gateway settings.");
                        }
                    }

                    toast.loading("Creating your order...", {
                        id: "order-creation",
                        duration: 10000,
                    });

                    const orderResponse = await fetchApi("/payment/checkout", {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            amount,
                            currency: "INR",
                            paymentGateway: "RAZORPAY",
                            couponCode: coupon?.code || null,
                            couponId: coupon?.id || null,
                            discountAmount: totals.discount || 0,
                        }),
                    });

                    toast.dismiss("order-creation");

                    if (!orderResponse.success) {
                        throw new Error(orderResponse.message || "Failed to create order");
                    }

                    toast.success("Order created! Opening payment gateway...", { duration: 2000 });

                    const razorpayOrder = orderResponse.data;
                    setOrderId(razorpayOrder.id);

                    toast.loading("Loading payment gateway...", {
                        id: "payment-gateway",
                        duration: 5000,
                    });

                    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
                    toast.dismiss("payment-gateway");

                    if (!loaded) throw new Error("Razorpay SDK failed to load");

                    const options = {
                        key: currentKey,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency,
                        name: "Aashey — Pure A2 Cow Ghee",
                        description: "Traditional Bilona A2 Ghee — Pure, Natural, Authentic.",
                        order_id: razorpayOrder.id,
                        prefill: {
                            name: user?.name || "",
                            email: user?.email || "",
                            contact: user?.phone || "",
                        },
                        handler: async function (response) {
                            setProcessing(true);
                            toast.loading("Verifying your payment...", {
                                id: "payment-verification",
                                duration: 10000,
                            });

                            try {
                                const verificationResponse = await fetchApi("/payment/verify", {
                                    method: "POST",
                                    credentials: "include",
                                    body: JSON.stringify({
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                        razorpayOrderId: response.razorpay_order_id,
                                        razorpayPaymentId: response.razorpay_payment_id,
                                        razorpaySignature: response.razorpay_signature,
                                        shippingAddressId: selectedAddressId,
                                        billingAddressSameAsShipping: true,
                                        couponCode: coupon?.code || null,
                                        couponId: coupon?.id || null,
                                        discountAmount: totals.discount || 0,
                                        notes: "",
                                    }),
                                });

                                toast.dismiss("payment-verification");

                                if (verificationResponse.success) {
                                    toast.success("Payment verified successfully! 🎉", { duration: 3000 });
                                    setOrderId(verificationResponse.data.orderId);
                                    handleSuccessfulPayment(response, verificationResponse.data, false);
                                } else {
                                    throw new Error(verificationResponse.message || "Payment verification failed");
                                }
                            } catch (error) {
                                console.error("Payment verification error:", error);
                                toast.dismiss("payment-verification");

                                if (error.message?.includes("previously cancelled")) {
                                    setError("Your previous order was cancelled. Please refresh the page and try again.");
                                    toast.error("Please refresh the page to start a new checkout", { duration: 6000 });
                                } else {
                                    setError(error.message || "Payment verification failed");
                                    toast.error(error.message || "Payment verification failed. Please try again.", { duration: 5000 });
                                }
                                setProcessing(false);
                            }
                        },
                        theme: { color: "#FD5D0D" },
                        modal: {
                            ondismiss: function () {
                                setProcessing(false);
                            },
                        },
                    };

                    const razorpay = new window.Razorpay(options);
                    razorpay.open();
                } else {
                    toast.error("Please select a payment method");
                }
            } catch (error) {
                console.error("Checkout error:", error);
                toast.dismiss("order-creation");
                toast.dismiss("payment-gateway");
                toast.dismiss("payment-verification");

                if (error.message?.includes("order was previously cancelled")) {
                    setError("This order was previously cancelled. Please refresh the page to start a new checkout.");
                    toast.error("Please refresh the page to start a new checkout", { duration: 6000 });
                } else {
                    setError(error.message || "Checkout failed");
                    toast.error(error.message || "Checkout failed", { duration: 4000 });
                }
            } finally {
                setProcessing(false);
            }

        } else {
            // ---------- GUEST USER FLOW ----------
            if (!validateGuestAddress()) {
                toast.error("Please fill in all required address fields");
                return;
            }

            setProcessing(true);
            setError("");

            const guestCartItems = buildGuestCartItems();

            if (!guestCartItems.length) {
                toast.error("Your cart is empty");
                setProcessing(false);
                return;
            }

            try {
                const calculatedAmount = totals.total;
                const amount = Math.max(parseFloat(calculatedAmount.toFixed(2)), 1);

                if (paymentMethod === "CASH") {
                    toast.loading("Creating your order...", {
                        id: "order-creation",
                        duration: 10000,
                    });

                    const orderResponse = await fetchApi("/payment/guest/cash-order", {
                        method: "POST",
                        body: JSON.stringify({
                            guestAddress,
                            cartItems: guestCartItems,
                            couponCode: coupon?.code || null,
                            couponId: coupon?.id || null,
                            discountAmount: totals.discount || 0,
                        }),
                    });

                    toast.dismiss("order-creation");

                    if (!orderResponse.success) {
                        throw new Error(orderResponse.message || "Failed to create order");
                    }

                    const orderData = {
                        orderNumber: orderResponse.data.orderNumber,
                        orderId: orderResponse.data.orderId,
                        paymentMethod: "CASH",
                    };
                    setOrderNumber(orderResponse.data.orderNumber);
                    handleSuccessfulPayment(null, orderData, true);
                    return;

                } else if (paymentMethod === "RAZORPAY") {
                    toast.loading("Creating your order...", {
                        id: "order-creation",
                        duration: 10000,
                    });

                    const orderResponse = await fetchApi("/payment/guest/checkout", {
                        method: "POST",
                        body: JSON.stringify({
                            guestAddress,
                            cartItems: guestCartItems,
                            currency: "INR",
                            couponCode: coupon?.code || null,
                            couponId: coupon?.id || null,
                            discountAmount: totals.discount || 0,
                        }),
                    });

                    toast.dismiss("order-creation");

                    if (!orderResponse.success) {
                        throw new Error(orderResponse.message || "Failed to create order");
                    }

                    const razorpayOrder = orderResponse.data;
                    const guestRazorpayKey = razorpayOrder.razorpayKey;
                    setOrderId(razorpayOrder.id);

                    toast.success("Order created! Opening payment gateway...", { duration: 2000 });
                    toast.loading("Loading payment gateway...", {
                        id: "payment-gateway",
                        duration: 5000,
                    });

                    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
                    toast.dismiss("payment-gateway");

                    if (!loaded) throw new Error("Razorpay SDK failed to load");

                    const options = {
                        key: guestRazorpayKey,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency,
                        name: "Aashey — Pure A2 Cow Ghee",
                        description: "Traditional Bilona A2 Ghee — Pure, Natural, Authentic.",
                        order_id: razorpayOrder.id,
                        prefill: {
                            name: guestAddress.name,
                            email: guestAddress.email,
                            contact: guestAddress.phone,
                        },
                        handler: async function (response) {
                            setProcessing(true);
                            toast.loading("Verifying your payment...", {
                                id: "payment-verification",
                                duration: 10000,
                            });

                            try {
                                const verificationResponse = await fetchApi("/payment/guest/verify", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                        guestAddress,
                                        cartItems: guestCartItems,
                                        couponCode: coupon?.code || null,
                                        couponId: coupon?.id || null,
                                        discountAmount: totals.discount || 0,
                                    }),
                                });

                                toast.dismiss("payment-verification");

                                if (verificationResponse.success) {
                                    toast.success("Payment verified successfully! 🎉", { duration: 3000 });
                                    setOrderId(verificationResponse.data.orderId);
                                    handleSuccessfulPayment(response, verificationResponse.data, true);
                                } else {
                                    throw new Error(verificationResponse.message || "Payment verification failed");
                                }
                            } catch (error) {
                                console.error("Guest payment verification error:", error);
                                toast.dismiss("payment-verification");
                                setError(error.message || "Payment verification failed");
                                toast.error(error.message || "Payment verification failed. Please try again.", { duration: 5000 });
                                setProcessing(false);
                            }
                        },
                        theme: { color: "#FD5D0D" },
                        modal: {
                            ondismiss: function () {
                                setProcessing(false);
                            },
                        },
                    };

                    const razorpay = new window.Razorpay(options);
                    razorpay.open();
                } else {
                    toast.error("Please select a payment method");
                }
            } catch (error) {
                console.error("Guest checkout error:", error);
                toast.dismiss("order-creation");
                toast.dismiss("payment-gateway");
                toast.dismiss("payment-verification");

                const isAccountExists =
                    error.statusCode === 409 ||
                    error.message?.toLowerCase().includes("already exists");

                if (isAccountExists) {
                    setError("An account with this email already exists. Please log in to continue.");
                    toast.error("Account already exists. Please log in.", {
                        duration: 6000,
                    });
                } else {
                    setError(error.message || "Checkout failed");
                    toast.error(error.message || "Checkout failed", { duration: 4000 });
                }
            } finally {
                setProcessing(false);
            }
        }
    };

    // Is checkout button disabled?
    const isCheckoutDisabled = () => {
        if (processing) return true;
        if (!paymentMethod) return true;
        if (isAuthenticated) {
            return !selectedAddressId || addresses.length === 0;
        }
        // Guest: check required fields are non-empty
        const { name, email, phone, street, city, state, postalCode } = guestAddress;
        return !name || !email || !phone || !street || !city || !state || !postalCode;
    };

    if (loadingAddresses && isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // If order created successfully
    if (orderCreated) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-lg mx-auto bg-white p-8 rounded-lg border shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>

                    <div className="relative z-10">
                        <div className="relative flex justify-center">
                            <div className="h-36 w-36 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <PartyPopper
                                    className={`h-20 w-20 text-primary ${confettiCannon ? "animate-pulse" : ""}`}
                                />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-ping absolute h-40 w-40 rounded-full bg-primary opacity-20"></div>
                                <div className="animate-ping absolute h-32 w-32 rounded-full bg-green-500 opacity-10 delay-150"></div>
                                <div className="animate-ping absolute h-24 w-24 rounded-full bg-yellow-500 opacity-10 delay-300"></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2 text-[#3F1F00] animate-pulse">
                                Woohoo!
                            </h1>
                            <h2 className="text-2xl font-bold mb-2 text-[#3F1F00]">
                                Order Confirmed!
                            </h2>

                            {orderNumber && (
                                <div className="bg-primary/10 py-2 px-4 rounded-full inline-block mb-3">
                                    <p className="text-lg font-semibold text-primary">
                                        Order #{orderNumber}
                                    </p>
                                </div>
                            )}

                            <div className="my-6 flex items-center justify-center bg-green-50 p-4 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                                <p className="text-xl text-green-600 font-medium">
                                    {paymentMethod === "CASH" ? "Order Confirmed — Pay on Delivery" : "Payment Successful"}
                                </p>
                            </div>

                            <p className="text-[#5C3A1E] mb-4 max-w-md mx-auto">
                                Thank you for your purchase! Your order has been successfully
                                placed and you&apos;ll receive an email confirmation shortly.
                            </p>

                            {/* Guest account notice */}
                            {isGuestOrder && (
                                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                    <div className="flex items-start gap-2">
                                        <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800 mb-1">
                                                Account created for you
                                            </p>
                                            <p className="text-sm text-blue-700">
                                                We created an account with your email. Use &quot;Forgot Password&quot; to set your password and track your orders anytime.
                                            </p>
                                            <Link href="/auth?tab=forgot">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm underline mt-1">
                                                    Set my password →
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Review CTA - only purchasers can review */}
                            {orderItemsForReview.length > 0 && (
                                <div className="mb-6 bg-amber-50/80 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                        <h3 className="font-semibold text-[#3F1F00]">Share your experience</h3>
                                    </div>
                                    <p className="text-sm text-[#5C3A1E] mb-3">
                                        Help others by reviewing what you bought. Only verified purchasers can leave reviews.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {orderItemsForReview.map((item) => (
                                            <Link
                                                key={item.productId}
                                                href={`/products/${item.productSlug}#reviews`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400 gap-1.5"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    Review {item.productName?.length > 20 ? item.productName.slice(0, 18) + "…" : item.productName}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center justify-center space-x-2 mb-3">
                                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                    <p className="text-blue-700">
                                        Redirecting in {redirectCountdown} seconds...
                                    </p>
                                </div>
                                <div className="text-center">
                                    {isGuestOrder ? (
                                        <Link href="/">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                                                Go to homepage →
                                            </button>
                                        </Link>
                                    ) : (
                                        <Link href="/account/orders">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                                                Go to orders now →
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                {isGuestOrder ? (
                                    <>
                                        <Link href="/auth?tab=login">
                                            <Button className="gap-2 bg-primary hover:bg-primary/90">
                                                <LogIn size={16} />
                                                Log In
                                            </Button>
                                        </Link>
                                        <Link href="/products">
                                            <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
                                                <Gift size={16} />
                                                Continue Shopping
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/account/orders">
                                            <Button className="gap-2 bg-primary hover:bg-primary/90">
                                                <ShoppingBag size={16} />
                                                My Orders
                                            </Button>
                                        </Link>
                                        <Link href="/products">
                                            <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
                                                <Gift size={16} />
                                                Continue Shopping
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 relative">
            {/* Loading Overlay for Payment Processing */}
            {processing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                        <div className="mb-6">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#3F1F00] mb-2">
                                Processing Your Payment
                            </h3>
                            <p className="text-[#5C3A1E] text-sm leading-relaxed">
                                Please wait while we securely process your payment. Do not
                                refresh or close this page.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100"></div>
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200"></div>
                            </div>
                            <p className="text-xs text-[#6B4423]">
                                This may take a few moments...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                    <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <p className="text-red-700 font-semibold">Error</p>
                        <p className="text-red-600">{error}</p>
                        {error.includes("email already exists") && (
                            <Link href="/auth?redirect=checkout">
                                <button className="mt-2 text-red-700 underline text-sm font-medium hover:text-red-900">
                                    Log in to your account →
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Guest login prompt banner */}
            {!isAuthenticated && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-amber-600" />
                        <p className="text-amber-800 text-sm">
                            Already have an account?{" "}
                            <Link href="/auth?redirect=checkout" className="font-semibold underline hover:text-amber-900">
                                Log in for faster checkout
                            </Link>
                        </p>
                    </div>
                    <Link href="/auth?redirect=checkout">
                        <Button variant="outline" size="sm" className="border-amber-400 text-amber-800 hover:bg-amber-100 gap-1.5 flex-shrink-0">
                            <LogIn className="h-4 w-4" />
                            Log In
                        </Button>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main checkout area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-primary" />
                                Shipping Address
                            </h2>
                            {isAuthenticated && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add New
                                </Button>
                            )}
                        </div>

                        {/* Authenticated: saved addresses */}
                        {isAuthenticated && (
                            <>
                                {showAddressForm && (
                                    <AddressForm
                                        onSuccess={handleAddressFormSuccess}
                                        onCancel={() => setShowAddressForm(false)}
                                        isInline={true}
                                    />
                                )}

                                {addresses.length === 0 && !showAddressForm ? (
                                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                        <span className="text-yellow-700">
                                            You don&apos;t have any saved addresses.{" "}
                                            <button
                                                className="font-medium underline"
                                                onClick={() => setShowAddressForm(true)}
                                            >
                                                Add an address
                                            </button>{" "}
                                            to continue.
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showAddressForm ? "mt-6" : ""}`}
                                    >
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className={`border rounded-md p-4 cursor-pointer transition-all ${selectedAddressId === address.id
                                                    ? "border-primary bg-primary/5"
                                                    : "hover:border-gray-400"
                                                    }`}
                                                onClick={() => handleAddressSelect(address.id)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-medium">{address.name}</span>
                                                    {address.isDefault && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-[#5C3A1E]">
                                                    <p>{address.street}</p>
                                                    <p>
                                                        {address.city}, {address.state} {address.postalCode}
                                                    </p>
                                                    <p>{address.country}</p>
                                                    <p className="mt-1">
                                                        Phone: {address.phone || "Not provided"}
                                                    </p>
                                                </div>
                                                <div className="mt-3 flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="addressSelection"
                                                        checked={selectedAddressId === address.id}
                                                        onChange={() => handleAddressSelect(address.id)}
                                                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                                    />
                                                    <label className="ml-2 text-sm font-medium">
                                                        Ship to this address
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Guest: inline address form */}
                        {!isAuthenticated && (
                            <div className="space-y-4">
                                <p className="text-sm text-[#5C3A1E]">
                                    Enter your delivery details below.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F1F00] mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={guestAddress.name}
                                            onChange={handleGuestAddressChange}
                                            placeholder="John Doe"
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${guestAddressErrors.name ? "border-red-400" : "border-gray-300"}`}
                                        />
                                        {guestAddressErrors.name && (
                                            <p className="text-red-500 text-xs mt-1">{guestAddressErrors.name}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F1F00] mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={guestAddress.email}
                                            onChange={handleGuestAddressChange}
                                            placeholder="john@example.com"
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${guestAddressErrors.email ? "border-red-400" : "border-gray-300"}`}
                                        />
                                        {guestAddressErrors.email && (
                                            <p className="text-red-500 text-xs mt-1">{guestAddressErrors.email}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F1F00] mb-1">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={guestAddress.phone}
                                            onChange={handleGuestAddressChange}
                                            placeholder="9876543210"
                                            maxLength={10}
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${guestAddressErrors.phone ? "border-red-400" : "border-gray-300"}`}
                                        />
                                        {guestAddressErrors.phone && (
                                            <p className="text-red-500 text-xs mt-1">{guestAddressErrors.phone}</p>
                                        )}
                                    </div>

                                    {/* Postal Code */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F1F00] mb-1">
                                            Postal Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={guestAddress.postalCode}
                                            onChange={handleGuestAddressChange}
                                            placeholder="400001"
                                            maxLength={6}
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${guestAddressErrors.postalCode ? "border-red-400" : "border-gray-300"}`}
                                        />
                                        {guestAddressErrors.postalCode && (
                                            <p className="text-red-500 text-xs mt-1">{guestAddressErrors.postalCode}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Street */}
                                <div>
                                    <label className="block text-sm font-medium text-[#3F1F00] mb-1">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={guestAddress.street}
                                        onChange={handleGuestAddressChange}
                                        placeholder="123 Main Street, Apartment 4B"
                                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${guestAddressErrors.street ? "border-red-400" : "border-gray-300"}`}
                                    />
                                    {guestAddressErrors.street && (
                                        <p className="text-red-500 text-xs mt-1">{guestAddressErrors.street}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F1F00] mb-1">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={guestAddress.city}
                                            onChange={handleGuestAddressChange}
                                            placeholder="Mumbai"
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${guestAddressErrors.city ? "border-red-400" : "border-gray-300"}`}
                                        />
                                        {guestAddressErrors.city && (
                                            <p className="text-red-500 text-xs mt-1">{guestAddressErrors.city}</p>
                                        )}
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#3F1F00] mb-1">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={guestAddress.state}
                                            onChange={handleGuestAddressChange}
                                            placeholder="Maharashtra"
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${guestAddressErrors.state ? "border-red-400" : "border-gray-300"}`}
                                        />
                                        {guestAddressErrors.state && (
                                            <p className="text-red-500 text-xs mt-1">{guestAddressErrors.state}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold flex items-center mb-4">
                            <CreditCard className="h-5 w-5 mr-2 text-primary" />
                            Payment Method
                        </h2>

                        {!paymentSettings.cashEnabled && !paymentSettings.razorpayEnabled ? (
                            <div className="border rounded-md p-4 bg-yellow-50 border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    No payment methods are currently available. Please contact support or try again later.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {paymentSettings.cashEnabled && (
                                    <div
                                        className={`border rounded-md p-4 transition-all ${paymentMethod === "CASH"
                                            ? "border-primary bg-primary/5 cursor-pointer"
                                            : "hover:border-gray-400 cursor-pointer"
                                            }`}
                                        onClick={() => handlePaymentMethodSelect("CASH")}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="cash"
                                                name="paymentMethod"
                                                checked={paymentMethod === "CASH"}
                                                onChange={() => handlePaymentMethodSelect("CASH")}
                                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                            />
                                            <label htmlFor="cash" className="ml-2 flex items-center flex-1">
                                                <span className="font-medium">Cash on Delivery (COD)</span>
                                                {paymentMethod === "CASH" && (
                                                    <span className="ml-2 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                                                        Selected
                                                    </span>
                                                )}
                                            </label>
                                            <Wallet className="h-4 w-4 text-green-600" />
                                        </div>
                                        <p className="text-sm mt-2 ml-6 text-[#5C3A1E]">
                                            Pay with cash when your order is delivered
                                            {paymentSettings.codCharge > 0 && (
                                                <span className="block mt-1 text-primary font-medium">
                                                    Note: An extra fee of {formatCurrency(paymentSettings.codCharge)} applies for COD orders.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {paymentSettings.razorpayEnabled && (
                                    <div
                                        className={`border rounded-md p-4 transition-all ${paymentMethod === "RAZORPAY"
                                            ? "border-primary bg-primary/5 cursor-pointer"
                                            : "hover:border-gray-400 cursor-pointer"
                                            }`}
                                        onClick={() => handlePaymentMethodSelect("RAZORPAY")}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="razorpay"
                                                name="paymentMethod"
                                                checked={paymentMethod === "RAZORPAY"}
                                                onChange={() => handlePaymentMethodSelect("RAZORPAY")}
                                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                            />
                                            <label htmlFor="razorpay" className="ml-2 flex items-center flex-1">
                                                <span className="font-medium">Pay Online (Razorpay)</span>
                                                {paymentMethod === "RAZORPAY" && (
                                                    <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                                        Selected
                                                    </span>
                                                )}
                                            </label>
                                            <IndianRupee className="h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-sm mt-2 ml-6 text-[#5C3A1E]">
                                            Pay securely with Credit/Debit Card, UPI, NetBanking, etc.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-20">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                        <div className="divide-y">
                            <div className="pb-4">
                                <p className="text-sm font-medium mb-2">
                                    {cart.totalQuantity || cart.items?.length} Items in Cart
                                </p>
                                <div className="max-h-52 overflow-y-auto space-y-3">
                                    {cart.items?.map((item) => {
                                        const imgUrl = (item.variant?.images?.length > 0
                                            ? (item.variant.images.find((i) => i.isPrimary)?.url || item.variant.images[0]?.url)
                                            : item.product?.images?.[0]?.url || item.product?.image || item.image) || null;
                                        const productName = item.product?.name || item.productName || "Product";
                                        return (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-100 rounded flex-shrink-0 relative overflow-hidden">
                                                    {imgUrl ? (
                                                        <Image
                                                            src={getImageUrl(imgUrl)}
                                                            alt={productName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {productName}
                                                    </p>
                                                    {item.variant?.attributes?.length > 0 && (
                                                        <p className="text-xs text-[#6B4423]">
                                                            {item.variant.attributes.map((attr, idx) => (
                                                                <span key={attr.attributeValueId}>
                                                                    {attr.attribute}: {attr.value}
                                                                    {idx < item.variant.attributes.length - 1 && " • "}
                                                                </span>
                                                            ))}
                                                        </p>
                                                    )}
                                                    {item.variantName && !item.variant?.attributes?.length && (
                                                        <p className="text-xs text-[#6B4423]">{item.variantName}</p>
                                                    )}
                                                    <p className="text-xs text-[#6B4423]">
                                                        {item.quantity} × {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                                <p className="font-medium text-sm">
                                                    {formatCurrency(item.subtotal)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="py-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#5C3A1E]">Subtotal</span>
                                    <span>{formatCurrency(totals.subtotal)}</span>
                                </div>

                                {coupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({coupon.code})</span>
                                        <span>-{formatCurrency(totals.discount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-[#5C3A1E]">Shipping</span>
                                    {totals.shipping > 0 ? (
                                        <span className="font-medium">{formatCurrency(totals.shipping)}</span>
                                    ) : (
                                        <span className="text-green-600 font-medium">FREE</span>
                                    )}
                                </div>

                                {paymentMethod === "CASH" && paymentSettings.codCharge > 0 && (
                                    <div className="flex justify-between text-[#5C3A1E]">
                                        <span>COD Surcharge</span>
                                        <span className="font-medium">{formatCurrency(paymentSettings.codCharge)}</span>
                                    </div>
                                )}

                                {totals.shipping > 0 && cart.freeShippingThreshold > 0 && (
                                    <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded text-center font-medium border border-amber-200">
                                        Add <strong>{formatCurrency(cart.freeShippingThreshold - totals.subtotal)}</strong> more for <span className="text-green-600 font-bold">FREE shipping!</span>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>
                                            {formatCurrency(
                                                totals.total + (paymentMethod === "CASH" ? (paymentSettings.codCharge || 0) : 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className={`w-full mt-6 bg-primary hover:bg-primary/90 text-white transition-all duration-200 ${processing ? "shadow-lg" : "hover:shadow-lg"}`}
                                size="lg"
                                onClick={handleCheckout}
                                disabled={isCheckoutDisabled()}
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        <span className="animate-pulse">Processing Payment...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <IndianRupee className="mr-2 h-4 w-4" />
                                        Place Order —{" "}
                                        {formatCurrency(
                                            totals.total + (paymentMethod === "CASH" ? (paymentSettings.codCharge || 0) : 0)
                                        )}
                                    </span>
                                )}
                            </Button>

                            <p className="text-xs text-[#6B4423] mt-4 text-center">
                                By placing your order, you agree to our terms and conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
