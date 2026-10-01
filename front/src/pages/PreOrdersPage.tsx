import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { orders } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Clock,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  PackageCheck,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";

interface PreOrderItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; slug: string };
  variant: { id: string; sku: string; quantity: number };
}

interface PreOrder {
  id: string;
  orderNumber: string;
  total: string | number;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
  items: PreOrderItem[];
}

export default function PreOrdersPage() {
  const [list, setList] = useState<PreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const fetchPreOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await orders.getPreOrders({ page, limit: 20 });
      if (response?.data?.success) {
        setList(response.data.data?.orders || []);
        setTotalPages(response.data.data?.pagination?.pages || 1);
        setTotal(response.data.data?.pagination?.total || 0);
        setError(null);
      } else {
        setError(response?.data?.message || "Failed to load pre-orders");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load pre-orders");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPreOrders();
  }, [fetchPreOrders]);

  const handleRelease = async (orderId: string, orderNumber: string) => {
    if (
      !window.confirm(
        `Release pre-order #${orderNumber}? Only do this once the item(s) are actually in stock — this moves the order to Processing and books Shiprocket.`
      )
    ) {
      return;
    }
    setReleasingId(orderId);
    try {
      const response = await orders.releasePreOrder(orderId);
      if (response?.data?.success) {
        const stillShort = response.data.data?.stillShort || [];
        if (stillShort.length > 0) {
          toast.warning(
            `Released, but these still show negative stock: ${stillShort.join(", ")}`,
            { duration: 8000 }
          );
        } else {
          toast.success(`Order #${orderNumber} released and moved to Processing`);
        }
        fetchPreOrders();
      } else {
        toast.error(response?.data?.message || "Failed to release pre-order");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to release pre-order");
    } finally {
      setReleasingId(null);
    }
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

  if (isLoading && list.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
      </div>
    );
  }

  if (error && list.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-[#9CA3AF]">{error}</p>
        <Button variant="outline" onClick={fetchPreOrders}>
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
          <h1 className="text-2xl font-semibold text-[#1F2937] tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-600" />
            Pre-Orders
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            Orders paid online for out-of-stock items — awaiting release once stock is ready.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span className="font-semibold text-amber-800">{total}</span>
          <span className="text-amber-600">awaiting release</span>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <PackageCheck className="h-10 w-10 text-[#D1D5DB]" />
            <p className="text-sm font-medium text-[#6B7280]">No pre-orders waiting for release</p>
            <p className="text-xs text-[#9CA3AF] text-center max-w-sm">
              When a customer pays online for a product with Pre-Order enabled, it shows up here
              until you release it (once real stock is confirmed).
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((order) => (
            <Card key={order.id} className="border-amber-200 bg-amber-50/30 rounded-xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#1F2937]">#{order.orderNumber}</h3>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                        <Clock className="h-3 w-3 mr-1" /> Pre-Ordered
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <User className="h-3.5 w-3.5" />
                      <span>{order.user?.name || "Guest"}</span>
                      <span className="text-[#D1D5DB]">•</span>
                      <span>{order.user?.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </div>

                    {/* Pre-order items with live stock */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.items?.map((item) => {
                        const short = (item.variant?.quantity ?? 0) < 0;
                        return (
                          <span
                            key={item.id}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border font-medium",
                              short
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-white text-[#374151] border-[#E5E7EB]"
                            )}
                            title={short ? "Still shows insufficient stock" : "Stock looks fine"}
                          >
                            {item.product?.name} × {item.quantity}
                            {short && ` (stock: ${item.variant?.quantity})`}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold text-[#1F2937] mr-2">
                      {formatCurrency(
                        typeof order.total === "string" ? parseFloat(order.total) : order.total
                      )}
                    </p>
                    <Button variant="outline" size="sm" asChild className="h-9">
                      <Link to={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-1.5" /> View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 bg-amber-600 hover:bg-amber-700 text-white"
                      disabled={releasingId === order.id}
                      onClick={() => handleRelease(order.id, order.orderNumber)}
                    >
                      {releasingId === order.id ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <PackageCheck className="h-4 w-4 mr-1.5" />
                      )}
                      Release
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-[#9CA3AF]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[#E5E7EB]"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[#E5E7EB]"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
