"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/dynamic-icon";
import { fetchApi, formatCurrency, formatDate } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { ProtectedRoute } from "@/components/protected-route";
import { getImageUrl } from "@/lib/imageUrl";

const STATUS_CONFIG = {
    PENDING:    { label: "Pending Review", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "Clock" },
    APPROVED:   { label: "Approved",       color: "bg-green-100 text-green-800 border-green-200",   icon: "CheckCircle" },
    REJECTED:   { label: "Rejected",       color: "bg-red-100 text-red-800 border-red-200",         icon: "XCircle" },
    PROCESSING: { label: "Processing",     color: "bg-blue-100 text-blue-800 border-blue-200",      icon: "RefreshCw" },
    COMPLETED:  { label: "Completed",      color: "bg-purple-100 text-purple-800 border-purple-200", icon: "PackageCheck" },
};

export default function ReturnsPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [returnRequests, setReturnRequests] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
    const [loadingReturns, setLoadingReturns] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")) : 1;

    useEffect(() => {
        const fetchReturns = async () => {
            if (!isAuthenticated) return;
            setLoadingReturns(true);
            setError("");
            try {
                const params = new URLSearchParams({ page: page.toString(), limit: "10" });
                if (statusFilter) params.append("status", statusFilter);
                const response = await fetchApi(`/returns/my-returns?${params.toString()}`, { credentials: "include" });
                setReturnRequests(response.data.returnRequests || []);
                setPagination(response.data.pagination || { total: 0, page: 1, limit: 10, pages: 0 });
            } catch (error) {
                setError("Failed to load return requests. Please try again later.");
            } finally {
                setLoadingReturns(false);
            }
        };
        fetchReturns();
    }, [isAuthenticated, page, statusFilter]);

    const changePage = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/account/returns?${params.toString()}`);
    };

    return (
        <ProtectedRoute>
            <ClientOnly>
                <div>
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#1A0A00]">Return Requests</h1>
                            <p className="text-[#5C3A1E] text-sm mt-1">
                                {pagination.total > 0 ? `${pagination.total} request${pagination.total !== 1 ? "s" : ""} total` : "Track your return requests here"}
                            </p>
                        </div>
                        <Link href="/account/orders">
                            <Button variant="outline" size="sm">
                                <DynamicIcon name="Package" className="h-4 w-4 mr-2" />
                                View Orders
                            </Button>
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <DynamicIcon name="AlertCircle" className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {[
                            { value: "", label: "All" },
                            { value: "PENDING", label: "Pending" },
                            { value: "APPROVED", label: "Approved" },
                            { value: "PROCESSING", label: "Processing" },
                            { value: "COMPLETED", label: "Completed" },
                            { value: "REJECTED", label: "Rejected" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => { setStatusFilter(tab.value); router.push("/account/returns?page=1"); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    statusFilter === tab.value
                                        ? "bg-[#3F1F00] text-[#FDF6E3]"
                                        : "bg-gray-100 text-[#5C3A1E] hover:bg-gray-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loadingReturns ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                            <p className="text-[#6B4423] text-sm">Loading return requests...</p>
                        </div>
                    ) : returnRequests.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <DynamicIcon name="RotateCcw" className="h-8 w-8 text-[#7A4E2D]" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-[#1A0A00]">No Return Requests</h2>
                            <p className="text-[#5C3A1E] mb-6 text-sm">
                                {statusFilter
                                    ? `No ${statusFilter.toLowerCase()} return requests found.`
                                    : "You haven't submitted any return requests yet."}
                            </p>
                            <Link href="/account/orders">
                                <Button>View My Orders</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {returnRequests.map((req) => {
                                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                                const productImage =
                                    req.orderItem?.variant?.images?.[0] ||
                                    req.orderItem?.product?.images?.[0];

                                return (
                                    <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        {/* Card header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <p className="font-semibold text-[#1A0A00]">Order #{req.order.orderNumber}</p>
                                                <span className="text-gray-300">·</span>
                                                <p className="text-sm text-[#5C3A1E]">{formatDate(req.createdAt)}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${cfg.color}`}>
                                                <DynamicIcon name={cfg.icon} className="h-3 w-3" />
                                                {cfg.label}
                                            </span>
                                        </div>

                                        {/* Card body */}
                                        <div className="p-6">
                                            <div className="flex gap-4">
                                                {/* Product image */}
                                                {productImage && (
                                                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={getImageUrl(productImage)}
                                                            alt={req.orderItem?.product?.name || "Product"}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                )}

                                                {/* Product info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-[#1A0A00] mb-0.5">
                                                        {req.orderItem?.product?.name || "Product"}
                                                    </p>
                                                    <p className="text-sm text-[#5C3A1E]">
                                                        Qty: {req.orderItem?.quantity} ×{" "}
                                                        {formatCurrency(req.orderItem?.price)}
                                                    </p>

                                                    {/* Variant attributes */}
                                                    {req.orderItem?.variant?.attributes &&
                                                        Object.keys(req.orderItem.variant.attributes).length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                {Object.entries(req.orderItem.variant.attributes).map(([key, val]) => (
                                                                    <span key={key} className="text-xs bg-gray-100 text-[#5C3A1E] px-2 py-0.5 rounded">
                                                                        {key}: {val.value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>

                                            {/* Return reason */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Return Reason</p>
                                                    <p className="text-sm font-medium text-[#1A0A00]">{req.reason}</p>
                                                    {req.customReason && (
                                                        <p className="text-sm text-[#5C3A1E] mt-0.5">{req.customReason}</p>
                                                    )}
                                                </div>
                                                {req.processedAt && (
                                                    <div>
                                                        <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Processed On</p>
                                                        <p className="text-sm text-[#1A0A00]">{formatDate(req.processedAt)}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Admin notes */}
                                            {req.adminNotes && (
                                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                                                        <DynamicIcon name="MessageSquare" className="h-3 w-3" /> Admin Notes
                                                    </p>
                                                    <p className="text-sm text-amber-700">{req.adminNotes}</p>
                                                </div>
                                            )}

                                            {/* Status-specific messages */}
                                            {req.status === "APPROVED" && (
                                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                                                    Your return has been approved. A pickup will be arranged shortly.
                                                </div>
                                            )}
                                            {req.status === "REJECTED" && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                                    Your return request was rejected. Please contact support if you have questions.
                                                </div>
                                            )}
                                        </div>

                                        {/* Card footer */}
                                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                                            <Link href={`/account/orders/${req.order.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <DynamicIcon name="Eye" className="h-3.5 w-3.5 mr-2" />
                                                    View Order
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => changePage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        <DynamicIcon name="ChevronLeft" className="h-4 w-4 mr-1" /> Previous
                                    </Button>
                                    <span className="text-sm text-[#5C3A1E]">Page {page} of {pagination.pages}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => changePage(page + 1)}
                                        disabled={page === pagination.pages}
                                    >
                                        Next <DynamicIcon name="ChevronRight" className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ClientOnly>
        </ProtectedRoute>
    );
}
