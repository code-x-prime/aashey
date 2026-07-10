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
  useEffect(() => { if (orderDetails && !orderDetails.shiprocket?.awbCode) fetchCouriers(); }, [orderDetails, fetchCouriers]);

  const handleBookShipment = async () => {
    if (!id || !selectedCourierId) return;
    setBookingShipment(true);
    try {
      const response = await orders.bookShipment(id, selectedCourierId);
      if (response?.data?.success) {
        toast.success("Shipment booked! AWB: " + (response.data.data.order.awbCode || "assigned"));
        fetchOrderDetails();
      } else { toast.error(response?.data?.message || "Failed to book shipment"); }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Failed to book shipment");
    } finally { setBookingShipment(false); }
  };

  const [cancellingShipment, setCancellingShipment] = useState(false);
  const [resyncing, setResyncing] = useState(false);
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
        fetchOrderDetails();
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
    PENDING:           "bg-amber-50 text-amber-600 border-amber-200",
    PROCESSING:        "bg-blue-50 text-blue-600 border-blue-200",
    PAID:              "bg-indigo-50 text-indigo-600 border-indigo-200",
    SHIPPED:           "bg-purple-50 text-purple-600 border-purple-200",
    DELIVERED:         "bg-emerald-50 text-emerald-600 border-emerald-200",
    CANCELLED:         "bg-red-50 text-red-500 border-red-200",
    REFUNDED:          "bg-violet-50 text-violet-600 border-violet-200",
    RETURN_APPROVED:   "bg-orange-50 text-orange-500 border-orange-200",
    RETURN_COMPLETED:  "bg-teal-50 text-teal-600 border-teal-200",
    APPROVED:          "bg-emerald-50 text-emerald-600 border-emerald-200",
    REJECTED:          "bg-red-50 text-red-500 border-red-200",
    // Shiprocket statuses
    CREATED:           "bg-sky-50 text-sky-600 border-sky-200",
    AWB_ASSIGNED:      "bg-blue-50 text-blue-600 border-blue-200",
    PICKUP_SCHEDULED:  "bg-indigo-50 text-indigo-600 border-indigo-200",
    PICKED_UP:         "bg-purple-50 text-purple-600 border-purple-200",
    IN_TRANSIT:        "bg-violet-50 text-violet-600 border-violet-200",
    OUT_FOR_DELIVERY:  "bg-amber-50 text-amber-600 border-amber-200",
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
  const subTotal  = toNum(orderDetails.subTotal);
  const shipping  = toNum(orderDetails.shippingCost);
  const discount  = toNum(orderDetails.discount);
  const codCharge = toNum(orderDetails.codCharge);
  const grandTotal = toNum(orderDetails.total) || (subTotal + shipping + codCharge - discount);
  const stepIdx = STATUS_STEPS.indexOf(orderDetails.status);
  const isCancelled = ["CANCELLED", "REFUNDED", "RETURN_APPROVED", "RETURN_COMPLETED"].includes(orderDetails.status);

  return (
    <div className="space-y-5 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-[#9CA3AF] hover:text-[#1F2937]">
            <Link to="/orders"><ChevronLeft className="h-4 w-4 mr-1" />All Orders</Link>
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[#1F2937]">#{orderDetails.orderNumber}</h1>
            <Badge className={cn("text-xs font-semibold border px-3 py-1", statusColor(orderDetails.status))}>
              {orderDetails.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-sm text-[#9CA3AF] flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(orderDetails.createdAt)}
            </span>
          </div>
        </div>

        {/* Status action buttons */}
        {!isCancelled && orderDetails.status !== "DELIVERED" && (
          <div className="flex flex-wrap gap-2">
            {orderDetails.status === "PENDING" && (
              <Button size="sm" variant="outline" className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleStatusUpdate("PROCESSING")}>
                Mark Processing
              </Button>
            )}
            {(orderDetails.status === "PROCESSING" || orderDetails.status === "PAID") && (
              <Button size="sm" variant="outline" className="h-8 text-xs border-purple-200 text-purple-600 hover:bg-purple-50" onClick={() => handleStatusUpdate("SHIPPED")}>
                Mark Shipped
              </Button>
            )}
            {orderDetails.status === "SHIPPED" && (
              <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => handleStatusUpdate("DELIVERED")}>
                Mark Delivered
              </Button>
            )}
            {(orderDetails.status === "PENDING" || orderDetails.status === "PROCESSING") && (
              <Button size="sm" variant="outline" className="h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => handleStatusUpdate("PAID")}>
                Mark Paid
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-500 hover:bg-red-50" onClick={() => handleStatusUpdate("CANCELLED")}>
              Cancel Order
            </Button>
          </div>
        )}
      </div>

      {/* ── Status Timeline ── */}
      {!isCancelled && (
        <Card className="border-[#E5E7EB]">
          <CardContent className="px-6 py-5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= stepIdx;
                const current = idx === stepIdx;
                const Icon = [ShoppingCart, Package, Truck, CheckCircle][idx];
                return (
                  <React.Fragment key={step}>
                    {idx > 0 && <div className={cn("flex-1 h-0.5 mx-2", done ? "bg-emerald-400" : "bg-[#E5E7EB]")} />}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center",
                        done ? "bg-emerald-500 text-white" : current ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-300" : "bg-[#F3F4F6] text-[#9CA3AF]")}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wide", done ? "text-emerald-600" : "text-[#9CA3AF]")}>
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
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Order Cancelled</p>
            {orderDetails.cancelReason && <p className="text-sm text-red-600 mt-0.5">Reason: {orderDetails.cancelReason}</p>}
            {orderDetails.cancelledAt && <p className="text-xs text-red-400 mt-1">{formatDate(orderDetails.cancelledAt)}</p>}
          </div>
        </div>
      )}

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Items + Tracking */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Items Table */}
          <Card className="border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <Package className="h-4 w-4 text-[#4CAF50]" />
              <h2 className="font-semibold text-[#1F2937]">Order Items</h2>
              <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-full">{orderItems.length}</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                  <TableHead className="pl-5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Product</TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide text-center">Qty</TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide text-right">Price</TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide text-right pr-5">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item: OrderItem) => (
                  <TableRow key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA]">
                    <TableCell className="pl-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden shrink-0">
                          <img
                            src={getImageUrl(item.imageUrl || item.product?.imageUrl || (Array.isArray(item.product?.images) ? item.product.images[0] : null) || item.variant?.images?.[0]?.url || null)}
                            alt={item.product?.name || "Product"}
                            className="h-full w-full object-contain"
                            onError={(e) => { e.currentTarget.src = "/images/product-placeholder.jpg"; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1F2937] text-sm truncate max-w-[200px]">{item.product?.name || item.name || "Product"}</p>
                          {item.variant?.sku && (
                            <p className="text-xs text-[#9CA3AF] font-mono mt-0.5">SKU: {item.variant.sku}</p>
                          )}
                          {item.variant?.attributes?.map((attr, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded mr-1 mt-1">
                              {attr.attribute}: {attr.value}
                            </span>
                          ))}
                          {item.flashSaleName && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded font-medium">⚡ {item.flashSaleName} -{item.flashSaleDiscount}%</span>
                            </div>
                          )}
                          {item.returnRequest && (
                            <Badge className={cn("text-[10px] font-medium border mt-1 h-5 px-1.5", statusColor(item.returnRequest.status))}>
                              Return: {item.returnRequest.status.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-sm font-semibold text-[#1F2937] bg-[#F3F4F6] px-2.5 py-1 rounded-md">{item.quantity}</span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-xs text-[#9CA3AF] line-through">{formatCurrency(item.originalPrice)}</p>
                      )}
                      <p className="text-sm font-medium text-[#1F2937]">{formatCurrency(item.price)}</p>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-5">
                      <p className="text-sm font-bold text-[#1F2937]">{formatCurrency(item.subtotal)}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Price breakdown */}
            <div className="px-5 py-4 border-t border-[#E5E7EB] space-y-2.5 bg-[#FAFAFA]">
              <div className="flex justify-between text-sm text-[#6B7280]">
                <span>Subtotal</span><span className="font-medium text-[#1F2937]">{formatCurrency(subTotal)}</span>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between text-sm text-[#6B7280]">
                  <span>Shipping</span><span className="font-medium text-[#1F2937]">{formatCurrency(shipping)}</span>
                </div>
              )}
              {codCharge > 0 && (
                <div className="flex justify-between text-sm text-[#6B7280]">
                  <span>COD Surcharge</span><span className="font-medium text-[#1F2937]">{formatCurrency(codCharge)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Discount{orderDetails.couponCode ? ` (${orderDetails.couponCode})` : ""}</span>
                  <span className="font-medium text-emerald-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2.5 border-t border-[#E5E7EB]">
                <span className="font-bold text-[#1F2937]">Grand Total</span>
                <span className="text-lg font-bold text-[#1F2937] flex items-center gap-0.5">
                  <IndianRupee className="h-4 w-4" />{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Shiprocket Shipment Card */}
          <Card className="border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 bg-linear-to-r from-emerald-50 to-white border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <Truck className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937]">Shiprocket Shipment</h3>
                  <p className="text-xs text-[#9CA3AF]">Courier management & tracking</p>
                </div>
              </div>
              {orderDetails.shiprocket?.status && (
                <Badge className={cn("text-xs font-semibold border", statusColor(orderDetails.shiprocket.status))}>
                  {orderDetails.shiprocket.status.replace(/_/g, " ")}
                </Badge>
              )}
            </div>

            <CardContent className="px-5 py-5 space-y-4">
              {orderDetails.shiprocket?.status === "CANCELLED" ? (
                // ── Cancelled ──
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">Shipment Cancelled</p>
                        <p className="text-xs text-red-500">This shipment was cancelled in Shiprocket.</p>
                      </div>
                    </div>
                    {orderDetails.shiprocket.orderId && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-2 border border-red-100">
                          <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase">SR Order ID</p>
                          <p className="text-xs font-mono text-[#374151]">{orderDetails.shiprocket.orderId}</p>
                        </div>
                        {orderDetails.shiprocket.shipmentId && (
                          <div className="bg-white rounded-lg p-2 border border-red-100">
                            <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase">Shipment ID</p>
                            <p className="text-xs font-mono text-[#374151]">{orderDetails.shiprocket.shipmentId}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {orderDetails.status !== "CANCELLED" && (
                    <p className="text-xs text-[#6B7280] bg-[#F9FAFB] rounded-lg px-3 py-2 border border-[#E5E7EB]">
                      You can re-book a new shipment by selecting a courier below.
                    </p>
                  )}
                </div>
              ) : orderDetails.shiprocket?.awbCode ? (
                // ── Booked ──
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">AWB / Tracking No.</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xl font-bold text-[#1F2937] tracking-wider">{orderDetails.shiprocket.awbCode}</p>
                          <button onClick={() => { navigator.clipboard.writeText(orderDetails.shiprocket!.awbCode!); toast.success("Copied!"); }}
                            className="p-1 rounded-md hover:bg-emerald-100 text-emerald-600" title="Copy AWB">
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <a href={`https://shiprocket.co/tracking/${orderDetails.shiprocket.awbCode}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shrink-0">
                        <ExternalLink className="h-3.5 w-3.5" /> Track Live
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {orderDetails.shiprocket.courierName && (
                      <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                        <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-1">Courier</p>
                        <p className="text-sm font-semibold text-[#1F2937]">{orderDetails.shiprocket.courierName}</p>
                      </div>
                    )}
                    {orderDetails.shiprocket.orderId && (
                      <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                        <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-1">SR Order ID</p>
                        <p className="text-xs font-mono text-[#374151]">{orderDetails.shiprocket.orderId}</p>
                      </div>
                    )}
                    {orderDetails.shiprocket.shipmentId && (
                      <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                        <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-1">Shipment ID</p>
                        <p className="text-xs font-mono text-[#374151]">{orderDetails.shiprocket.shipmentId}</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons: Label, Invoice, Cancel */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleDownloadLabel}
                      className="h-8 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Label
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadInvoice}
                      className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Invoice
                    </Button>
                    {orderDetails.status !== "DELIVERED" && orderDetails.status !== "CANCELLED" && (
                      <Button variant="outline" size="sm" onClick={handleCancelShipment} disabled={cancellingShipment}
                        className="h-8 text-xs border-red-200 text-red-500 hover:bg-red-50 gap-1.5">
                        {cancellingShipment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        {cancellingShipment ? "Cancelling..." : "Cancel Shipment"}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-[#F9FAFB] rounded-lg px-3 py-2 border border-[#E5E7EB]">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Shipment booked. Click "Track Live" for real-time updates.
                  </div>
                </div>
              ) : (
                // ── Not booked ──
                <div className="space-y-4">
                  {(orderDetails.shiprocket?.orderId || orderDetails.shiprocket?.shipmentId) && (
                    <div className="grid grid-cols-2 gap-3">
                      {orderDetails.shiprocket.orderId && (
                        <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                          <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-1">SR Order ID</p>
                          <p className="text-xs font-mono text-[#374151]">{orderDetails.shiprocket.orderId}</p>
                        </div>
                      )}
                      {orderDetails.shiprocket.shipmentId && (
                        <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                          <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-1">Shipment ID</p>
                          <p className="text-xs font-mono text-[#374151]">{orderDetails.shiprocket.shipmentId}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Re-sync button for stuck orders */}
                  {orderDetails.shiprocket?.orderId && !orderDetails.shiprocket?.awbCode && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-amber-600" />
                        <p className="text-xs text-amber-700">Order exists on Shiprocket but AWB not assigned. Try re-syncing.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleResync} disabled={resyncing}
                        className="h-7 px-3 text-xs border-amber-300 text-amber-700 hover:bg-amber-100 gap-1.5 shrink-0">
                        {resyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        {resyncing ? "Syncing..." : "Re-sync"}
                      </Button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-[#1F2937]">Select Courier Partner</p>
                      <Button variant="ghost" size="sm" onClick={fetchCouriers} disabled={loadingCouriers} className="h-7 px-2 gap-1.5 text-xs text-[#6B7280]">
                        <RefreshCw className={cn("h-3 w-3", loadingCouriers && "animate-spin")} /> Refresh
                      </Button>
                    </div>

                    {loadingCouriers ? (
                      <div className="flex items-center justify-center gap-2 py-8 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB]">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                        <span className="text-sm text-[#9CA3AF]">Fetching couriers...</span>
                      </div>
                    ) : couriers.length > 0 ? (
                      <div className="space-y-2">
                        {couriers.map((c) => (
                          <label key={String(c.id)} className={cn(
                            "flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all",
                            selectedCourierId === c.id ? "border-emerald-500 bg-emerald-50" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                          )}>
                            <div className="flex items-center gap-3">
                              <input type="radio" name="courier" value={String(c.id)} checked={selectedCourierId === c.id}
                                onChange={() => setSelectedCourierId(c.id)} className="h-4 w-4 accent-emerald-600" />
                              <div>
                                <p className="text-sm font-semibold text-[#1F2937]">{c.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-[#9CA3AF]">ETD: {c.etd}</span>
                                  {c.codAvailable && <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-medium">COD</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-base font-bold text-[#1F2937]">₹{c.rate}</p>
                              <p className="text-[10px] text-[#9CA3AF]">shipping</p>
                            </div>
                          </label>
                        ))}
                        <Button onClick={handleBookShipment} disabled={!selectedCourierId || bookingShipment}
                          className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-sm font-semibold">
                          {bookingShipment ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Booking...</>) : (<><Truck className="h-4 w-4 mr-2" />Book Shipment</>)}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB]">
                        <Truck className="h-8 w-8 text-[#D1D5DB] mb-2" />
                        <p className="text-sm text-[#6B7280] font-medium">No couriers available</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">Check pickup address in Shiprocket settings</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Updates */}
          {orderDetails.tracking?.updates && orderDetails.tracking.updates.length > 0 && (
            <Card className="border-[#E5E7EB]">
              <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#4CAF50]" />
                <h2 className="font-semibold text-[#1F2937]">Tracking History</h2>
              </div>
              <CardContent className="px-5 py-4">
                <div className="space-y-3">
                  {orderDetails.tracking.updates.map((u: OrderUpdate, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {i < orderDetails.tracking!.updates!.length - 1 && <div className="w-0.5 flex-1 bg-[#E5E7EB] mt-1" />}
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-sm font-semibold text-[#1F2937]">{u.status}</p>
                        {u.location && <p className="text-xs text-[#6B7280] mt-0.5">{u.location}</p>}
                        {u.description && <p className="text-xs text-[#9CA3AF] mt-0.5">{u.description}</p>}
                        <p className="text-xs text-[#9CA3AF] mt-1">{formatDate(u.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4">

          {/* Customer */}
          <Card className="border-[#E5E7EB]">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <User className="h-4 w-4 text-[#4CAF50]" />
              <h2 className="font-semibold text-[#1F2937] text-sm">Customer</h2>
            </div>
            <CardContent className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-[#2E7D32]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">{orderDetails.user?.name || "Guest"}</p>
                </div>
              </div>
              {orderDetails.user?.email && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Mail className="h-3.5 w-3.5 shrink-0" />{orderDetails.user.email}
                </div>
              )}
              {orderDetails.user?.phone && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Phone className="h-3.5 w-3.5 shrink-0" />{orderDetails.user.phone}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-[#E5E7EB]">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#4CAF50]" />
              <h2 className="font-semibold text-[#1F2937] text-sm">Shipping Address</h2>
            </div>
            <CardContent className="px-5 py-4">
              {orderDetails.shippingAddress ? (
                <div className="text-sm text-[#374151] space-y-0.5">
                  {orderDetails.shippingAddress.name && <p className="font-semibold text-[#1F2937]">{orderDetails.shippingAddress.name}</p>}
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}</p>
                  <p>{orderDetails.shippingAddress.country}</p>
                  {orderDetails.shippingAddress.phone && (
                    <p className="flex items-center gap-1.5 text-[#6B7280] mt-2"><Phone className="h-3.5 w-3.5" />{orderDetails.shippingAddress.phone}</p>
                  )}
                </div>
              ) : <p className="text-sm text-[#9CA3AF]">No address found</p>}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="border-[#E5E7EB]">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#4CAF50]" />
              <h2 className="font-semibold text-[#1F2937] text-sm">Payment</h2>
            </div>
            <CardContent className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">Method</span>
                <span className="text-sm font-semibold text-[#1F2937]">
                  {orderDetails.paymentMethod || orderDetails.razorpayPayment?.paymentMethod || "ONLINE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">Status</span>
                <Badge className={cn("text-xs font-medium border",
                  (orderDetails.razorpayPayment?.status === "CAPTURED" || orderDetails.status === "PAID")
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-amber-50 text-amber-600 border-amber-200")}>
                  {orderDetails.razorpayPayment?.status || orderDetails.status}
                </Badge>
              </div>
              {orderDetails.paymentGateway && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9CA3AF]">Gateway</span>
                  <span className="text-xs text-[#374151]">
                    {orderDetails.paymentGateway}{orderDetails.paymentMode && ` · ${orderDetails.paymentMode}`}
                  </span>
                </div>
              )}
              {orderDetails.razorpayPayment?.razorpayPaymentId && (
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-1">Payment ID</p>
                  <p className="font-mono text-xs bg-[#F3F4F6] px-2 py-1.5 rounded border border-[#E5E7EB] text-[#374151] break-all">
                    {orderDetails.razorpayPayment.razorpayPaymentId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Meta */}
          <Card className="border-[#E5E7EB]">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#4CAF50]" />
              <h2 className="font-semibold text-[#1F2937] text-sm">Order Info</h2>
            </div>
            <CardContent className="px-5 py-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">Order ID</span>
                <span className="font-mono text-xs text-[#374151] bg-[#F3F4F6] px-2 py-0.5 rounded">{orderDetails.id?.slice(0, 8)}…</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">Placed</span>
                <span className="text-xs text-[#374151]">{formatDate(orderDetails.createdAt)}</span>
              </div>
              {orderDetails.couponCode && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#9CA3AF] flex items-center gap-1"><Tag className="h-3.5 w-3.5" />Coupon</span>
                  <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{orderDetails.couponCode}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1F2937]">Total Paid</span>
                  <span className="text-lg font-bold text-[#1F2937]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
