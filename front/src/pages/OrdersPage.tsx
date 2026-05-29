import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orders } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Eye,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Truck,
  ExternalLink,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function OrdersPage() {
  const { t } = useLanguage();
  const [ordersList, setOrdersList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: currentPage,
          limit: 15,
          ...(searchQuery && { search: searchQuery }),
          ...(selectedStatus && { status: selectedStatus }),
        };
        const response = await orders.getOrders(params);
        if (response?.data?.success) {
          setOrdersList(response.data.data?.orders || []);
          setTotalPages(response.data.data?.pagination?.pages || 1);
          setTotalOrders(response.data.data?.pagination?.total || 0);
        } else {
          setError(response.data?.message || t("orders.actions.load_error"));
        }
      } catch {
        setError(t("orders.actions.load_error"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, searchQuery, selectedStatus, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":    return "bg-amber-50 text-amber-600 border-amber-200";
      case "PROCESSING": return "bg-blue-50 text-blue-600 border-blue-200";
      case "PAID":       return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "SHIPPED":    return "bg-purple-50 text-purple-600 border-purple-200";
      case "DELIVERED":  return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "CANCELLED":  return "bg-red-50 text-red-500 border-red-200";
      case "REFUNDED":   return "bg-violet-50 text-violet-600 border-violet-200";
      case "RETURN_APPROVED":  return "bg-orange-50 text-orange-500 border-orange-200";
      case "RETURN_COMPLETED": return "bg-teal-50 text-teal-600 border-teal-200";
      default:           return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      PENDING: t("orders.status.pending"),
      PROCESSING: t("orders.status.processing"),
      SHIPPED: t("orders.status.shipped"),
      DELIVERED: t("orders.status.delivered"),
      CANCELLED: t("orders.status.cancelled"),
      REFUNDED: t("orders.status.refunded"),
      PAID: t("orders.status.paid"),
      RETURN_APPROVED: t("orders.status.return_approved") || "Return Approved",
      RETURN_COMPLETED: t("orders.status.return_completed") || "Return Completed",
    };
    return map[status] || status;
  };

  const STATUS_FILTERS = [
    { value: "PENDING",    label: "Pending" },
    { value: "PAID",       label: "Paid" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED",    label: "Shipped" },
    { value: "DELIVERED",  label: "Delivered" },
    { value: "CANCELLED",  label: "Cancelled" },
    { value: "RETURN_APPROVED", label: "Return" },
  ];

  if (isLoading && ordersList.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
      </div>
    );
  }

  if (error && ordersList.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-[#9CA3AF]">{error}</p>
        <Button variant="outline" onClick={() => { setError(null); setIsLoading(true); }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2937] tracking-tight">
            {t("orders.title")}
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            {totalOrders} total orders
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 bg-[#F3F4F6] px-3 py-1.5 rounded-lg">
            <ShoppingCart className="h-3.5 w-3.5 text-[#4B5563]" />
            <span className="font-semibold text-[#1F2937]">{totalOrders}</span>
            <span className="text-[#9CA3AF]">orders</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-emerald-600">
              {ordersList.filter((o: any) => o.status === "DELIVERED").length}
            </span>
            <span className="text-emerald-500">delivered</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input
              type="search"
              placeholder={t("orders.filters.search_placeholder")}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 h-9 border-[#E5E7EB]"
            />
          </form>
          {(searchQuery || selectedStatus) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchQuery(""); setSelectedStatus(""); setCurrentPage(1); }}
              className="text-[#9CA3AF] hover:text-[#1F2937] h-9"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setSelectedStatus(""); setCurrentPage(1); }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              selectedStatus === ""
                ? "bg-[#1F2937] text-white border-[#1F2937]"
                : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]"
            )}
          >
            All
          </button>
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setSelectedStatus(selectedStatus === value ? "" : value); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                selectedStatus === value
                  ? "bg-[#1F2937] text-white border-[#1F2937]"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#4CAF50]" />
          </div>
        ) : ordersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="h-10 w-10 text-[#D1D5DB]" />
            <p className="text-sm font-medium text-[#6B7280]">No orders found</p>
            {(searchQuery || selectedStatus) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setSelectedStatus(""); }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide pl-5">Order</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Date</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Items</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Shipment</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide text-right pr-5">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersList.map((order: any) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-[#F9FAFB] transition-colors border-b border-[#F3F4F6] last:border-0"
                >
                  {/* Order # */}
                  <TableCell className="pl-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F5E9] shrink-0">
                        <ShoppingCart className="h-4 w-4 text-[#2E7D32]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">#{order.orderNumber}</p>
                        <p className="text-xs text-[#9CA3AF] font-mono truncate max-w-[100px]">{order.id?.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className="py-4">
                    <p className="text-sm font-medium text-[#1F2937] truncate max-w-[140px]">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-[#9CA3AF] truncate max-w-[140px]">
                      {order.user?.email || "—"}
                    </p>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-4">
                    <p className="text-sm text-[#374151] whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </p>
                  </TableCell>

                  {/* Items */}
                  <TableCell className="py-4">
                    <span className="text-sm text-[#374151]">
                      {order._count?.items ?? order.items?.length ?? 0}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    <Badge className={cn("text-xs font-medium border px-2.5 py-0.5 whitespace-nowrap", getStatusBadgeClass(order.status))}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>

                  {/* Shipment */}
                  <TableCell className="py-4">
                    {order.awbCode ? (
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={`https://shiprocket.co/tracking/${order.awbCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-mono text-[#4CAF50] hover:underline"
                        >
                          <Truck className="h-3 w-3 shrink-0" />
                          {order.awbCode}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        {order.courierName && (
                          <p className="text-xs text-[#9CA3AF]">{order.courierName}</p>
                        )}
                      </div>
                    ) : order.shiprocketStatus ? (
                      <span className="text-xs text-[#9CA3AF]">
                        {order.shiprocketStatus.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <span className="text-xs text-[#D1D5DB]">—</span>
                    )}
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="py-4 text-right pr-5">
                    <p className="text-sm font-bold text-[#1F2937]">
                      {formatCurrency(
                        order.total || order.totalAmount ||
                        (parseFloat(order.subTotal || 0) +
                          parseFloat(order.shippingCost || 0) -
                          parseFloat(order.discount || 0))
                      )}
                    </p>
                    {parseFloat(order.discount || 0) > 0 && (
                      <p className="text-xs text-emerald-500">-{formatCurrency(parseFloat(order.discount))}</p>
                    )}
                    {!!order.couponCode && (
                      <p className="text-xs text-[#9CA3AF]">{order.couponCode}</p>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-[#F3F4F6]"
                      asChild
                      title={t("orders.actions.view_details")}
                    >
                      <Link to={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 text-[#4B5563]" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-[#9CA3AF]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[#E5E7EB]"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={cn("h-8 w-8 p-0", currentPage !== page && "border-[#E5E7EB]")}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[#E5E7EB]"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
