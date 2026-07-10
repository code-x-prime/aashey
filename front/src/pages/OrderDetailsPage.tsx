import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { orders } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Package,
  CreditCard,
  MapPin,
  Clock,
  User,
  Truck,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  Phone,
  Mail,
  Tag,
  Hash,
  Calendar,
  IndianRupee,
  XCircle,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { getImageUrl } from "@/utils/image";

interface ShiprocketCourier { id: number; name: string; rate: number; etd: string; codAvailable: boolean; }
interface OrderUpdate { id: string; status: string; timestamp: string; note?: string; location?: string; description?: string; }
interface OrderItem {
  id: string; productId: string; quantity: number; price: number; subtotal: number;
  imageUrl?: string; name?: string;
  product?: { title: string; name: string; images: string[]; imageUrl?: string; };
  variant?: { sku: string; attributes?: Array<{ attribute: string; value: string; }>; flavor?: { name: string; }; weight?: { value: number; unit: string; }; images?: Array<{ url: string; }>; };
  returnRequest?: { id: string; status: string; reason: string; customReason?: string; createdAt: string; processedAt?: string; } | null;
  flashSaleName?: string; flashSaleDiscount?: number; originalPrice?: number;
}
interface OrderDetails {
  id: string; orderNumber: string; status: string; totalAmount: number;
  subTotal: string | number; shippingAmount: number; taxAmount: number;
  discount?: string | number; codCharge?: string | number;
  createdAt: string; updatedAt: string; cancelledAt?: string; cancelReason?: string; cancelledBy?: string; userId?: string; couponCode?: string;
  shippingAddress: { name?: string; street: string; city: string; state: string; postalCode: string; country: string; phone?: string; };
  user: { name: string; email: string; phone?: string; };
  items: OrderItem[]; updates?: OrderUpdate[];
  paymentGateway?: string; paymentMode?: string; paymentMethod?: string;
  razorpayPayment?: { paymentMethod: string; status: string; razorpayPaymentId?: string; razorpayOrderId?: string; };
  coupon?: { discountType: string; discountValue: number; description?: string; };
  tracking?: { carrier?: string; trackingNumber?: string; status?: string; estimatedDelivery?: string; updates?: OrderUpdate[]; };
  shiprocket?: { orderId?: number; shipmentId?: number; awbCode?: string; courierName?: string; status?: string; };
  shippingCost?: string | number; total?: string | number;
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  useLanguage();

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couriers, setCouriers] = useState<ShiprocketCourier[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);
  const [bookingShipment, setBookingShipment] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await orders.getOrderById(id);
      if (response?.data?.success && response?.data?.data?.order) {
        setOrderDetails(response.data.data.order);
      } else {
        setError(response?.data?.message || "Failed to load order");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const e = err as { response: { status: number; data?: { message?: string } } };
        setError(`API Error (${e.response.status}): ${e.response.data?.message || "Unknown error"}`);
      } else {
        setError("Network error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchCouriers = useCallback(async () => {
    if (!id) return;
    setLoadingCouriers(true);
    try {
      const response = await orders.getOrderCouriers(id);
      if (response?.data?.success) setCouriers(response.data.data.couriers || []);
    } catch { /* silent */ } finally { setLoadingCouriers(false); }
  }, [id]);

  useEffect(() => { fetchOrderDetails(); }, [fetchOrderDetails]);

  // Only fetch couriers if: order is not cancelled, shipment is not cancelled, and no AWB yet
  useEffect(() => {
    if (
      orderDetails &&
      !orderDetails.shiprocket?.awbCode &&
      orderDetails.status !== "CANCELLED" &&
      orderDetails.shiprocket?.status !== "CANCELLED"
    ) {
      fetchCouriers();
    }
  }, [orderDetails, fetchCouriers]);

  const handleBookShipment = async () => {
    if (!id || !selectedCourierId) return;
    setBookingShipment(true);
    try {
      const response = await orders.bookShipment(id, selectedCourierId);
      if (response?.data?.success) {
        toast.success("Shipment booked! AWB: " + (response.data.data.order.awbCode || "assigned"));
        await fetchOrderDetails();
        setSelectedCourierId(null);
        setCouriers([]);
      } else { toast.error(response?.data?.message || "Failed to book shipment"); }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Failed to book shipment");
    } finally { setBookingShipment(false); }
  };

  const [cancellingShipment, setCancellingShipment] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const isShiprocketSynced = !!orderDetails?.shiprocket?.orderId;
  const isShiprocketAwaitingAwb = isShiprocketSynced && !orderDetails?.shiprocket?.awbCode;

  const handleCancelShipment = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to cancel this shipment? This cannot be undone.")) return;
    setCancellingShipment(true);
    try {
      const response = await orders.cancelShipment(id);
      if (response?.data?.success) {
        toast.success(response.data.message || "Shipment cancelled successfully");
        fetchOrderDetails();
      } else { toast.error(response?.data?.message || "Failed to cancel shipment"); }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Failed to cancel shipment");
    } finally { setCancellingShipment(false); }
  };

  const handleResync = async () => {
    if (!id) return;
    setResyncing(true);
    try {
      const response = await orders.resyncOrder(id);
      if (response?.data?.success) {
        toast.success(response.data.message || "Order re-synced with Shiprocket");
        await fetchOrderDetails();
        setSelectedCourierId(null);
        setCouriers([]);
      } else { toast.error(response?.data?.message || "Re-sync failed"); }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Re-sync failed");
    } finally { setResyncing(false); }
  };

  const handleDownloadLabel = async () => {
    if (!id) return;
    try {
      const response = await orders.getShippingLabel(id);
      if (response?.data?.success) {
        const labelUrl = response.data.data?.label_url;
        if (labelUrl) {
          window.open(labelUrl, "_blank");
        } else {
          toast.info("Label generated. Check Shiprocket dashboard for download.");
        }
      } else { toast.error(response?.data?.message || "Label not available yet"); }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Failed to generate label");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!id) return;
    try {
      const response = await orders.getOrderInvoice(id);
      if (response?.data?.success) {
        const invoiceUrl = response.data.data?.invoice_url;
        if (invoiceUrl) {
          window.open(invoiceUrl, "_blank");
        } else {
          toast.info("Invoice generated. Check Shiprocket dashboard for download.");
        }
      } else { toast.error(response?.data?.message || "Invoice not available yet"); }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Failed to generate invoice");
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    try {
      const response = await orders.updateOrderStatus(id, { status: newStatus });
      if (response?.data?.success) {
        // Show Shiprocket status if order was cancelled
        if (newStatus === "CANCELLED") {
          const srCancelled = response.data.data?.shiprocketCancelled;
          const srError = response.data.data?.shiprocketCancelError;
          if (srCancelled) {
            toast.success("Order cancelled. Shiprocket shipment also cancelled.");
          } else if (srError) {
            toast.warning("Order cancelled. Shiprocket cancellation failed — cancel manually on Shiprocket.");
          } else {
            toast.success("Order cancelled successfully.");
          }
        } else {
          toast.success(`Status updated to ${newStatus}`);
        }
        setOrderDetails((prev) => prev ? { ...prev, status: newStatus } : prev);
        fetchOrderDetails();
      } else { toast.error(response.data?.message || "Update failed"); }
    } catch { toast.error("Update failed"); }
  };

  const formatDate = (s: string) => {
    if (!s) return "—";
    return new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(s));
  };

  const toNum = (v: string | number | undefined) => typeof v === "string" ? parseFloat(v) || 0 : (v || 0);

  const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    PROCESSING: "bg-blue-50 text-blue-600 border-blue-200",
    PAID: "bg-indigo-50 text-indigo-600 border-indigo-200",
    SHIPPED: "bg-purple-50 text-purple-600 border-purple-200",
    DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-500 border-red-200",
    REFUNDED: "bg-violet-50 text-violet-600 border-violet-200",
    RETURN_APPROVED: "bg-orange-50 text-orange-500 border-orange-200",
    RETURN_COMPLETED: "bg-teal-50 text-teal-600 border-teal-200",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    REJECTED: "bg-red-50 text-red-500 border-red-200",
    // Shiprocket statuses
    CREATED: "bg-sky-50 text-sky-600 border-sky-200",
    AWB_ASSIGNED: "bg-blue-50 text-blue-600 border-blue-200",
    PICKUP_SCHEDULED: "bg-indigo-50 text-indigo-600 border-indigo-200",
    PICKED_UP: "bg-purple-50 text-purple-600 border-purple-200",
    IN_TRANSIT: "bg-violet-50 text-violet-600 border-violet-200",
    OUT_FOR_DELIVERY: "bg-amber-50 text-amber-600 border-amber-200",
  };
  const statusColor = (s: string) => STATUS_COLORS[s] || "bg-gray-100 text-gray-500 border-gray-200";

  // ---------- Loading / Error ----------
  if (isLoading && !orderDetails) return (
    <div className="flex h-full items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
    </div>
  );

  if (error && !orderDetails) return (
    <div className="flex h-full flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-[#9CA3AF]">{error}</p>
      <Button variant="outline" onClick={fetchOrderDetails}>Retry</Button>
    </div>
  );

  if (!orderDetails) return null;

  const orderItems = orderDetails.items || [];
  const subTotal = toNum(orderDetails.subTotal);
  const shipping = toNum(orderDetails.shippingCost);
  const discount = toNum(orderDetails.discount);
  const codCharge = toNum(orderDetails.codCharge);
  const grandTotal = toNum(orderDetails.total) || (subTotal + shipping + codCharge - discount);
  const stepIdx = STATUS_STEPS.indexOf(orderDetails.status);
  const isCancelled = ["CANCELLED", "REFUNDED", "RETURN_APPROVED", "RETURN_COMPLETED"].includes(orderDetails.status);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Header Card ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="mb-1 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 gap-1.5 rounded-lg">
            <Link to="/orders"><ChevronLeft className="h-4 w-4" />Back to Orders</Link>
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">#{orderDetails.orderNumber}</h1>
            <Badge className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs", statusColor(orderDetails.status))}>
              {orderDetails.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(orderDetails.createdAt)}
            </span>
          </div>
        </div>

        {/* Status action buttons */}
        {!isCancelled && orderDetails.status !== "DELIVERED" && (
          <div className="flex flex-wrap gap-2">
            {orderDetails.status === "PENDING" && (
              <Button size="sm" variant="outline" className="h-9 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl" onClick={() => handleStatusUpdate("PROCESSING")}>
                Mark Processing
              </Button>
            )}
            {(orderDetails.status === "PROCESSING" || orderDetails.status === "PAID") && (
              <Button size="sm" variant="outline" className="h-9 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl" onClick={() => handleStatusUpdate("SHIPPED")}>
                Mark Shipped
              </Button>
            )}
            {orderDetails.status === "SHIPPED" && (
              <Button size="sm" className="h-9 text-xs bg-[#5C3A1E] hover:bg-[#4a2e18] text-white rounded-xl shadow-xs border-0" onClick={() => handleStatusUpdate("DELIVERED")}>
                Mark Delivered
              </Button>
            )}
            {(orderDetails.status === "PENDING" || orderDetails.status === "PROCESSING") && (
              <Button size="sm" variant="outline" className="h-9 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl" onClick={() => handleStatusUpdate("PAID")}>
                Mark Paid
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-9 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl" onClick={() => handleStatusUpdate("CANCELLED")}>
              Cancel Order
            </Button>
          </div>
        )}
      </div>

      {/* ── Status Timeline ── */}
      {!isCancelled && (
        <Card className="border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="px-6 py-6 bg-slate-50/50">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= stepIdx;
                const current = idx === stepIdx;
                const Icon = [ShoppingCart, Package, Truck, CheckCircle][idx];
                return (
                  <React.Fragment key={step}>
                    {idx > 0 && <div className={cn("flex-1 h-1 rounded-full mx-3 transition-colors duration-300", done ? "bg-amber-500" : "bg-slate-200")} />}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                        done ? "bg-amber-600 text-white" : current ? "bg-amber-100 text-amber-700 ring-4 ring-amber-50" : "bg-white text-slate-400 border border-slate-200")}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", done ? "text-amber-800" : "text-slate-400")}>
                        {step === "PENDING" ? "Placed" : step.charAt(0) + step.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Cancelled banner ── */}
      {orderDetails.status === "CANCELLED" && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-6 py-5 flex items-start gap-4 shadow-sm animate-pulse">
          <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-800 text-base">Order Cancelled</p>
            {orderDetails.cancelReason && <p className="text-sm text-rose-600">Reason: {orderDetails.cancelReason}</p>}
            {orderDetails.cancelledAt && <p className="text-xs text-rose-400 font-medium">{formatDate(orderDetails.cancelledAt)}</p>}
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT Column: Items & Shiprocket */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items Table */}
          <Card className="border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="font-bold text-slate-800 text-lg">Order Items</h2>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">{orderItems.length} {orderItems.length === 1 ? 'Item' : 'Items'}</span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                    <TableHead className="pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Product Details</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center py-4">Qty</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right py-4">Unit Price</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6 py-4">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-100/50 hover:bg-slate-50/20 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                            {item.imageUrl || item.product?.imageUrl ? (
                              <img src={getImageUrl(item.imageUrl || item.product?.imageUrl)} alt={item.name || item.product?.title} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-slate-300" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-800 text-sm hover:text-amber-700 transition-colors cursor-pointer">{item.name || item.product?.title || item.product?.name}</p>
                            {item.variant?.sku && (
                              <p className="text-[11px] text-slate-400 font-mono">SKU: {item.variant.sku}</p>
                            )}
                            {item.variant?.attributes?.map((attr, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mr-1.5 mt-1">
                                {attr.attribute}: {attr.value}
                              </span>
                            ))}
                            {item.flashSaleName && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-200/50 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">⚡ {item.flashSaleName} -{item.flashSaleDiscount}%</span>
                              </div>
                            )}
                            {item.returnRequest && (
                              <Badge className={cn("text-[9px] font-bold border mt-1.5 h-5 px-2 rounded-md shadow-2xs", statusColor(item.returnRequest.status))}>
                                Return: {item.returnRequest.status.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/45">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-xs text-slate-400 line-through mb-0.5">{formatCurrency(item.originalPrice)}</p>
                        )}
                        <p className="text-sm font-semibold text-slate-700">{formatCurrency(item.price)}</p>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(item.subtotal)}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Price Breakdown */}
            <div className="px-6 py-5 border-t border-slate-100 space-y-3 bg-slate-50/30">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">{formatCurrency(subTotal)}</span>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(shipping)}</span>
                </div>
              )}
              {codCharge > 0 && (
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>COD Surcharge</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(codCharge)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-emerald-600">Discount{orderDetails.couponCode ? ` (${orderDetails.couponCode})` : ""}</span>
                  <span className="font-bold text-emerald-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3.5 border-t border-slate-100">
                <span className="font-bold text-slate-700 text-sm">Grand Total</span>
                <span className="text-lg font-black text-slate-800 flex items-center gap-0.5">
                  <IndianRupee className="h-4.5 w-4.5 text-slate-800" />{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Shiprocket Card */}
          <Card className="border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="px-6 py-5 bg-linear-to-r from-amber-50/40 to-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Truck className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Shiprocket Shipment</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Courier management & live tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Shiprocket Sync Status Badge */}
                {orderDetails.shiprocket?.orderId ? (
                  <span className="text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Synced to Shiprocket
                  </span>
                ) : orderDetails.status !== "CANCELLED" ? (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
                    Not yet sent
                  </span>
                ) : null}
                {orderDetails.shiprocket?.status && (
                  <Badge className={cn("text-xs font-bold border px-2.5 py-0.5 rounded-full shadow-2xs", statusColor(orderDetails.shiprocket.status))}>
                    {orderDetails.shiprocket.status.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="px-6 py-6 space-y-5">
              {isShiprocketAwaitingAwb ? (
                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800">Order is synced to Shiprocket, but AWB is not assigned yet.</p>
                  <p className="text-xs text-amber-600 mt-1">
                    This order has been created in Shiprocket. Choose a courier partner below to assign the AWB or click Re-sync if the shipment was already booked.
                  </p>
                </div>
              ) : !isShiprocketSynced ? (
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-800">Order is not yet synced to Shiprocket.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a courier partner below to send this order to Shiprocket and book the shipment.
                  </p>
                </div>
              ) : null}

              {orderDetails.shiprocket?.status === "CANCELLED" ? (
                // ── Cancelled Shipment ──
                <div className="space-y-4">
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-rose-800">Shipment Cancelled in Shiprocket</p>
                      <p className="text-xs text-rose-500 mt-0.5">The shipment for this order was cancelled. You can re-book by selecting a courier below.</p>
                    </div>
                  </div>
                  {orderDetails.shiprocket.orderId && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">SR Order ID</p>
                        <p className="text-xs font-bold text-slate-700 font-mono mt-0.5">{orderDetails.shiprocket.orderId}</p>
                      </div>
                      {orderDetails.shiprocket.shipmentId && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Shipment ID</p>
                          <p className="text-xs font-bold text-slate-700 font-mono mt-0.5">{orderDetails.shiprocket.shipmentId}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Allow re-booking after Shiprocket cancel if order itself is not cancelled */}
                  {orderDetails.status !== "CANCELLED" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-700">Re-book Shipment</p>
                        <Button variant="ghost" size="sm" onClick={fetchCouriers} disabled={loadingCouriers} className="h-8 px-2.5 gap-1.5 text-xs text-slate-500 rounded-lg hover:bg-slate-50">
                          <RefreshCw className={cn("h-3 w-3", loadingCouriers && "animate-spin")} /> Refresh rates
                        </Button>
                      </div>
                      {loadingCouriers ? (
                        <div className="flex items-center justify-center gap-2 py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                          <span className="text-xs text-slate-400">Fetching couriers...</span>
                        </div>
                      ) : couriers.length > 0 ? (
                        <div className="space-y-2.5">
                          {couriers.map((c) => (
                            <label key={String(c.id)} className={cn(
                              "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:border-amber-300",
                              selectedCourierId === c.id ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20" : "border-slate-200 bg-white"
                            )}>
                              <div className="flex items-center gap-3">
                                <input type="radio" name="courier" value={String(c.id)} checked={selectedCourierId === c.id}
                                  onChange={() => setSelectedCourierId(c.id)} className="h-4 w-4 accent-amber-600" />
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 font-medium">Delivery ETD: {c.etd}</span>
                                    {c.codAvailable && <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md font-bold">COD</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-base font-black text-slate-800">₹{c.rate}</p>
                                <p className="text-[10px] text-slate-400 font-medium">est. shipping</p>
                              </div>
                            </label>
                          ))}
                          <Button onClick={handleBookShipment} disabled={!selectedCourierId || bookingShipment}
                            className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white h-11 text-sm font-bold rounded-xl shadow-xs border-0 gap-2">
                            {bookingShipment ? (<><Loader2 className="h-4 w-4 animate-spin" />Booking shipment...</>) : (<><Truck className="h-4 w-4" />Re-Book Shipment</>)}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : orderDetails.shiprocket?.awbCode ? (
                // ── Booked Shipment — AWB assigned ──
                <div className="space-y-5">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-2xs">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">AWB / Tracking Number</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-2xl font-black text-slate-800 tracking-wider">{orderDetails.shiprocket.awbCode}</p>
                          <button onClick={() => { navigator.clipboard.writeText(orderDetails.shiprocket!.awbCode!); toast.success("Copied AWB!"); }}
                            className="p-1.5 rounded-lg hover:bg-emerald-100/70 text-emerald-700 transition-colors" title="Copy AWB">
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <a href={`https://shiprocket.co/tracking/${orderDetails.shiprocket.awbCode}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 border-0">
                        <ExternalLink className="h-3.5 w-3.5" /> Track Live
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {orderDetails.shiprocket.courierName && (
                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Courier</p>
                        <p className="text-xs font-bold text-slate-700">{orderDetails.shiprocket.courierName}</p>
                      </div>
                    )}
                    {orderDetails.shiprocket.orderId && (
                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">SR Order ID</p>
                        <p className="text-xs font-bold text-slate-700 font-mono">{orderDetails.shiprocket.orderId}</p>
                      </div>
                    )}
                    {orderDetails.shiprocket.shipmentId && (
                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Shipment ID</p>
                        <p className="text-xs font-bold text-slate-700 font-mono">{orderDetails.shiprocket.shipmentId}</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons: Label, Invoice, Cancel */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <Button variant="outline" size="sm" onClick={handleDownloadLabel}
                      className="h-9 text-xs border-emerald-100 text-emerald-700 hover:bg-emerald-50 gap-1.5 rounded-xl">
                      <Download className="h-3.5 w-3.5" /> Download Label
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadInvoice}
                      className="h-9 text-xs border-blue-150 text-blue-700 hover:bg-blue-50/70 gap-1.5 rounded-xl">
                      <FileText className="h-3.5 w-3.5" /> Print Invoice
                    </Button>
                    {orderDetails.status !== "DELIVERED" && orderDetails.status !== "CANCELLED" && (
                      <Button variant="outline" size="sm" onClick={handleCancelShipment} disabled={cancellingShipment}
                        className="h-9 text-xs border-rose-100 text-rose-600 hover:bg-rose-50 gap-1.5 rounded-xl ml-auto">
                        {cancellingShipment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        Cancel Shipment
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-150">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    Shipment booked in Shiprocket. AWB assigned. Click &ldquo;Track Live&rdquo; for live location updates.
                  </div>
                </div>
              ) : orderDetails.status === "CANCELLED" ? (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  Order is cancelled. Shipment booking is disabled.
                </div>
              ) : (
                // ── Courier Partner Selection (Not Booked Yet) ──
                <div className="space-y-4">
                  {/* Show if already synced to Shiprocket but AWB not assigned yet */}
                  {orderDetails.shiprocket?.orderId ? (
                    <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5 flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                        <div>
                          <p className="text-[10px] text-sky-500 font-semibold uppercase">SR Order ID</p>
                          <p className="text-xs font-bold text-slate-700 font-mono">{orderDetails.shiprocket.orderId}</p>
                        </div>
                        {orderDetails.shiprocket.shipmentId && (
                          <div>
                            <p className="text-[10px] text-sky-500 font-semibold uppercase">Shipment ID</p>
                            <p className="text-xs font-bold text-slate-700 font-mono">{orderDetails.shiprocket.shipmentId}</p>
                          </div>
                        )}
                        <p className="col-span-2 text-[11px] text-sky-700 font-medium mt-1">Order synced to Shiprocket. Now select a courier and book the shipment.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 font-medium">This order has not been sent to Shiprocket yet. Select a courier and click &ldquo;Confirm &amp; Book Shipment&rdquo; — it will be automatically created in Shiprocket.</p>
                    </div>
                  )}

                  {/* Re-sync button for stuck orders (has SR order but no AWB) */}
                  {orderDetails.shiprocket?.orderId && !orderDetails.shiprocket?.awbCode && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-4">
                      <p className="text-xs text-slate-600 font-medium">Order synced but AWB not assigned. Try re-syncing if it's been a while.</p>
                      <Button variant="outline" size="sm" onClick={handleResync} disabled={resyncing}
                        className="h-8 px-3 text-xs border-amber-200 text-amber-700 hover:bg-amber-100 gap-1.5 shrink-0 rounded-lg">
                        {resyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        Re-sync
                      </Button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <p className="text-sm font-bold text-slate-700">
                        {isShiprocketSynced ? "Assign Courier Partner for AWB" : "Select Courier Partner"}
                      </p>
                      <Button variant="ghost" size="sm" onClick={fetchCouriers} disabled={loadingCouriers} className="h-8 px-2.5 gap-1.5 text-xs text-slate-500 rounded-lg hover:bg-slate-50">
                        <RefreshCw className={cn("h-3 w-3", loadingCouriers && "animate-spin")} /> Refresh rates
                      </Button>
                    </div>

                    {loadingCouriers ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                        <span className="text-xs text-slate-400 font-medium">Fetching available couriers...</span>
                      </div>
                    ) : couriers.length > 0 ? (
                      <div className="space-y-2.5">
                        {couriers.map((c) => (
                          <label key={String(c.id)} className={cn(
                            "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:border-amber-300",
                            selectedCourierId === c.id ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20" : "border-slate-200 bg-white"
                          )}>
                            <div className="flex items-center gap-3">
                              <input type="radio" name="courier" value={String(c.id)} checked={selectedCourierId === c.id}
                                onChange={() => setSelectedCourierId(c.id)} className="h-4 w-4 accent-amber-600" />
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-slate-800">{c.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 font-medium">Delivery ETD: {c.etd}</span>
                                  {c.codAvailable && <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md font-bold">COD</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-base font-black text-slate-800">₹{c.rate}</p>
                              <p className="text-[10px] text-slate-400 font-medium">est. shipping</p>
                            </div>
                          </label>
                        ))}
                        <Button onClick={handleBookShipment} disabled={!selectedCourierId || bookingShipment}
                          className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white h-11 text-sm font-bold rounded-xl shadow-xs border-0 gap-2">
                          {bookingShipment ? (<><Loader2 className="h-4 w-4 animate-spin" />Booking shipment...</>) : (<><Truck className="h-4 w-4" />Confirm & Book Shipment</>)}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Truck className="h-10 w-10 text-slate-300 mb-2.5" />
                        <p className="text-sm text-slate-600 font-bold">No shipping couriers available</p>
                        <p className="text-xs text-slate-450 mt-1 max-w-xs text-center">Verify the delivery address or default pickup address configuration in settings.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Updates */}
          {orderDetails.tracking?.updates && orderDetails.tracking.updates.length > 0 && (
            <Card className="border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-650" />
                <h2 className="font-bold text-slate-850 text-base">Tracking History</h2>
              </div>
              <CardContent className="px-6 py-5">
                <div className="space-y-4">
                  {orderDetails.tracking.updates.map((u: OrderUpdate, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-xs" />
                        {i < orderDetails.tracking!.updates!.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-1.5" />}
                      </div>
                      <div className="pb-3 min-w-0 space-y-0.5">
                        <p className="text-sm font-bold text-slate-800">{u.status}</p>
                        {u.location && <p className="text-xs text-slate-500 font-medium">{u.location}</p>}
                        {u.description && <p className="text-xs text-slate-400">{u.description}</p>}
                        <p className="text-[10px] text-slate-400 font-mono mt-1">{formatDate(u.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT Column: Sidebar metadata cards */}
        <div className="space-y-6">

          {/* Customer Profile */}
          <Card className="border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-100 flex items-center gap-2.5">
              <User className="h-4.5 w-4.5 text-amber-650" />
              <h2 className="font-bold text-slate-800 text-sm">Customer Info</h2>
            </div>
            <CardContent className="px-5 py-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                  <User className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-850">{orderDetails.user?.name || "Guest Checkout"}</p>
                  <p className="text-[11px] text-slate-450 font-medium">Customer Profile</p>
                </div>
              </div>
              <div className="space-y-2 pt-1.5 border-t border-slate-100/60">
                {orderDetails.user?.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{orderDetails.user.email}</span>
                  </div>
                )}
                {orderDetails.user?.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{orderDetails.user.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-100 flex items-center gap-2.5">
              <MapPin className="h-4.5 w-4.5 text-amber-655" />
              <h2 className="font-bold text-slate-800 text-sm">Shipping Location</h2>
            </div>
            <CardContent className="px-5 py-4">
              {orderDetails.shippingAddress ? (
                <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {orderDetails.shippingAddress.name && <p className="font-bold text-slate-800 text-sm mb-1">{orderDetails.shippingAddress.name}</p>}
                  <p className="font-medium">{orderDetails.shippingAddress.street}</p>
                  <p className="font-semibold text-slate-700">{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.postalCode}</p>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{orderDetails.shippingAddress.country}</p>
                  {orderDetails.shippingAddress.phone && (
                    <div className="flex items-center gap-1.5 text-slate-500 pt-2 border-t border-slate-200/40 mt-2">
                      <Phone className="h-3.5 w-3.5 text-slate-450" />
                      <span className="font-mono">{orderDetails.shippingAddress.phone}</span>
                    </div>
                  )}
                </div>
              ) : <p className="text-xs text-slate-400">No address recorded.</p>}
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card className="border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-100 flex items-center gap-2.5">
              <CreditCard className="h-4.5 w-4.5 text-amber-650" />
              <h2 className="font-bold text-slate-800 text-sm">Payment Details</h2>
            </div>
            <CardContent className="px-5 py-4.5 space-y-3.5 bg-slate-50/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Method</span>
                <div className="flex items-center gap-2">
                  {orderDetails.paymentMethod === "CASH" ? (
                    <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      💵 COD (Cash on Delivery)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      💳 {orderDetails.razorpayPayment?.paymentMethod || orderDetails.paymentMethod || "Online"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Status</span>
                <Badge className={cn("text-xs font-bold border shadow-3xs px-2 py-0.5 rounded-full",
                  (orderDetails.razorpayPayment?.status === "CAPTURED" || orderDetails.status === "PAID")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200")}>
                  {orderDetails.razorpayPayment?.status || orderDetails.status}
                </Badge>
              </div>
              {orderDetails.paymentGateway && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Gateway Details</span>
                  <span className="font-medium text-slate-650">
                    {orderDetails.paymentGateway}{orderDetails.paymentMode && ` (${orderDetails.paymentMode})`}
                  </span>
                </div>
              )}
              {orderDetails.razorpayPayment?.razorpayPaymentId && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Razorpay Payment ID</p>
                  <p className="font-mono text-[11px] bg-slate-55/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50 text-slate-700 break-all">
                    {orderDetails.razorpayPayment.razorpayPaymentId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Info Metadata */}
          <Card className="border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-100 flex items-center gap-2.5">
              <Hash className="h-4.5 w-4.5 text-amber-650" />
              <h2 className="font-bold text-slate-800 text-sm">System Metadata</h2>
            </div>
            <CardContent className="px-5 py-4 space-y-3.5 bg-slate-50/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Order UUID</span>
                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{orderDetails.id?.slice(0, 16)}…</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Created At</span>
                <span className="font-medium text-slate-600">{formatDate(orderDetails.createdAt)}</span>
              </div>
              {orderDetails.couponCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-slate-450" />Active Coupon</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">{orderDetails.couponCode}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Net Charged</span>
                  <span className="text-base font-black text-slate-800">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

