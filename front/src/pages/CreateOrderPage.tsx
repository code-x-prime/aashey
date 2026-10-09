import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  Search,
  UserCheck,
  UserPlus,
  CreditCard,
  Wallet,
  Package,
} from "lucide-react";
import { orders, products as productsApi } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

interface OrderLine {
  key: string;
  variantId: string;
  productName: string;
  sku: string;
  stock: number;
  unitPrice: number; // catalogue price, shown for reference
  price: string; // editable override ("" = use catalogue price)
  quantity: number;
}

const emptyAddress = { street: "", city: "", state: "", postalCode: "" };

export default function CreateOrderPage() {
  const navigate = useNavigate();

  // Customer
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [existingCustomer, setExistingCustomer] = useState<any | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Address
  const [address, setAddress] = useState(emptyAddress);

  // Items
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "CASH">("RAZORPAY");
  const [razorpayPaymentId, setRazorpayPaymentId] = useState("");
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [shippingCost, setShippingCost] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [codCharge, setCodCharge] = useState("0");
  const [notes, setNotes] = useState("");
  const [triggerShiprocket, setTriggerShiprocket] = useState(true);
  const [sendCustomerEmail, setSendCustomerEmail] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // ── Existing-customer lookup (when the email field loses focus) ──────────
  const lookupCustomer = async () => {
    const email = customer.email.trim();
    if (!email.includes("@")) {
      setExistingCustomer(null);
      return;
    }
    try {
      setLookingUp(true);
      const res = await orders.lookupCustomerByEmail(email);
      const found = res?.data?.data?.customer;
      setExistingCustomer(found || null);
      if (found) {
        // Only fill blanks — never overwrite what the admin already typed
        setCustomer((c) => ({
          ...c,
          name: c.name || found.name || "",
          phone: c.phone || found.phone || "",
        }));
        const def = found.addresses?.find((a: any) => a.isDefault) || found.addresses?.[0];
        if (def && !address.street) {
          setAddress({
            street: def.street || "",
            city: def.city || "",
            state: def.state || "",
            postalCode: def.postalCode || "",
          });
        }
      }
    } catch {
      setExistingCustomer(null);
    } finally {
      setLookingUp(false);
    }
  };

  // ── Product search (debounced) ────────────────────────────────────────────
  useEffect(() => {
    const q = productSearch.trim();
    if (q.length < 2) {
      setProductResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await productsApi.getProducts({ search: q, limit: 8 });
        setProductResults(res?.data?.data?.products || []);
      } catch {
        setProductResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [productSearch]);

  const variantLabel = (v: any) => {
    const attrs = Array.isArray(v.attributes)
      ? v.attributes.map((a: any) => a.value || a.attributeValue?.value).filter(Boolean).join(" / ")
      : "";
    return attrs || v.sku;
  };

  const addVariant = (product: any, variant: any) => {
    const stock = Number(variant.quantity ?? variant.stock ?? 0);
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variant.id);
      if (existing) {
        return prev.map((l) => (l.variantId === variant.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        {
          key: `${variant.id}-${Date.now()}`,
          variantId: variant.id,
          productName: `${product.name}${variantLabel(variant) !== variant.sku ? ` — ${variantLabel(variant)}` : ""}`,
          sku: variant.sku,
          stock,
          unitPrice: Number(variant.salePrice ?? variant.price ?? 0),
          price: "",
          quantity: 1,
        },
      ];
    });
    setProductSearch("");
    setProductResults([]);
  };

  const updateLine = (key: string, patch: Partial<OrderLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const subTotal = lines.reduce((s, l) => {
      const p = l.price !== "" ? parseFloat(l.price) || 0 : l.unitPrice;
      return s + p * l.quantity;
    }, 0);
    const ship = Math.max(parseFloat(shippingCost) || 0, 0);
    const cod = paymentMethod === "CASH" ? Math.max(parseFloat(codCharge) || 0, 0) : 0;
    const disc = Math.min(Math.max(parseFloat(discount) || 0, 0), subTotal);
    return { subTotal, ship, cod, disc, total: subTotal + ship + cod - disc };
  }, [lines, shippingCost, discount, codCharge, paymentMethod]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!customer.name.trim()) return toast.error("Enter the customer's name");
    if (!customer.email.includes("@")) return toast.error("Enter a valid email");
    if (customer.phone.replace(/\D/g, "").length < 10) return toast.error("Enter a 10-digit phone number");
    if (!address.street.trim() || !address.city.trim() || !address.state || !/^\d{6}$/.test(address.postalCode)) {
      return toast.error("Complete the address (street, city, state and 6-digit pincode)");
    }
    if (lines.length === 0) return toast.error("Add at least one product");
    if (paymentMethod === "RAZORPAY" && !/^pay_[A-Za-z0-9]+$/.test(razorpayPaymentId.trim())) {
      return toast.error("Enter the Razorpay Payment ID (starts with pay_)");
    }

    try {
      setSubmitting(true);
      const res = await orders.createManualOrder({
        customer,
        address: { ...address, phone: customer.phone },
        items: lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
          ...(l.price !== "" ? { price: parseFloat(l.price) } : {}),
        })),
        paymentMethod,
        razorpayPaymentId: paymentMethod === "RAZORPAY" ? razorpayPaymentId.trim() : undefined,
        markAsPaid: paymentMethod === "CASH" ? markAsPaid : undefined,
        shippingCost: parseFloat(shippingCost) || 0,
        discount: parseFloat(discount) || 0,
        codCharge: parseFloat(codCharge) || 0,
        notes: notes.trim() || undefined,
        triggerShiprocket,
        sendCustomerEmail,
      });
      if (res?.data?.success) {
        const d = res.data.data;
        toast.success(`Order #${d.order.orderNumber} created`);
        navigate(`/orders/${d.order.id}`);
      } else {
        toast.error(res?.data?.message || "Could not create the order");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not create the order");
    } finally {
      setSubmitting(false);
    }
  };

  const field = "h-9";

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1 text-[#9CA3AF] hover:text-[#1F2937]">
          <Link to="/orders">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-[#1F2937] tracking-tight">Create Order</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">
          Use this when a customer paid (or ordered by phone) but no order appeared. If the email already
          belongs to a customer, the order is added to their account; otherwise a new account is created.
        </p>
      </div>

      {/* Customer */}
      <Card className="border-[#E5E7EB] rounded-xl">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-[#1F2937]">1. Customer</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                className={field}
                type="email"
                placeholder="customer@example.com"
                value={customer.email}
                onChange={(e) => {
                  setCustomer({ ...customer, email: e.target.value });
                  setExistingCustomer(null);
                }}
                onBlur={lookupCustomer}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input className={field} value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input
                className={field}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>
          {lookingUp ? (
            <p className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking if this customer exists…
            </p>
          ) : existingCustomer ? (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" /> Existing customer found — the order will be added to their account.
              Name, phone and default address were filled in for you.
            </p>
          ) : customer.email.includes("@") ? (
            <p className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" /> New customer — an account will be created for this email.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="border-[#E5E7EB] rounded-xl">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-[#1F2937]">2. Delivery address</h2>
          <div className="space-y-1.5">
            <Label>Street address *</Label>
            <Input className={field} value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>City *</Label>
              <Input className={field} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>State *</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Pincode *</Label>
              <Input
                className={field}
                inputMode="numeric"
                maxLength={6}
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="border-[#E5E7EB] rounded-xl">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-[#1F2937]">3. Products</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input
              className="pl-9 h-9"
              placeholder="Search products by name…"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            {(searching || productResults.length > 0) && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white shadow-lg max-h-72 overflow-auto">
                {searching && <p className="p-3 text-xs text-[#9CA3AF]">Searching…</p>}
                {productResults.map((p) => (
                  <div key={p.id} className="border-b last:border-0 border-[#F3F4F6] p-2">
                    <p className="text-sm font-medium text-[#1F2937] px-1">{p.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(p.variants || []).map((v: any) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => addVariant(p, v)}
                          className="text-xs rounded-md border border-[#E5E7EB] px-2 py-1 hover:bg-[#F3F4F6] flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          {variantLabel(v)} · {formatCurrency(Number(v.salePrice ?? v.price ?? 0))} ·{" "}
                          <span className={Number(v.quantity ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}>
                            {Number(v.quantity ?? 0)} in stock
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-[#9CA3AF] gap-2 border border-dashed border-[#E5E7EB] rounded-lg">
              <Package className="h-8 w-8" />
              <p className="text-sm">Search above and pick a size/variant to add it</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E5E7EB] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1F2937] truncate">{l.productName}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      SKU {l.sku} · catalogue {formatCurrency(l.unitPrice)} ·{" "}
                      <span className={l.stock >= l.quantity ? "" : "text-red-500 font-medium"}>{l.stock} in stock</span>
                    </p>
                  </div>
                  <div className="w-28">
                    <Input
                      className="h-8 text-right"
                      type="number"
                      min="0"
                      placeholder={String(l.unitPrice)}
                      value={l.price}
                      onChange={(e) => updateLine(l.key, { price: e.target.value })}
                      title="Leave blank to use the catalogue price"
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      className="h-8 text-center"
                      type="number"
                      min="1"
                      value={l.quantity}
                      onChange={(e) => updateLine(l.key, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                    className="text-red-400 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-[#9CA3AF]">Price box: leave empty for the catalogue price, or type a custom unit price.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="border-[#E5E7EB] rounded-xl">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-[#1F2937]">4. Payment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { v: "RAZORPAY", title: "Online (Razorpay)", desc: "Customer already paid online", Icon: CreditCard },
              { v: "CASH", title: "Cash on Delivery", desc: "Collect on delivery", Icon: Wallet },
            ] as const).map(({ v, title, desc, Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setPaymentMethod(v)}
                className={cn(
                  "text-left rounded-lg border p-3 flex items-start gap-3 transition",
                  paymentMethod === v ? "border-[#4CAF50] bg-[#F0FDF4]" : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                )}
              >
                <Icon className="h-5 w-5 mt-0.5 text-[#4B5563]" />
                <span>
                  <span className="block text-sm font-medium text-[#1F2937]">{title}</span>
                  <span className="block text-xs text-[#9CA3AF]">{desc}</span>
                </span>
              </button>
            ))}
          </div>

          {paymentMethod === "RAZORPAY" ? (
            <div className="space-y-1.5">
              <Label>Razorpay Payment ID *</Label>
              <Input
                className={field}
                placeholder="pay_XXXXXXXXXXXXXX"
                value={razorpayPaymentId}
                onChange={(e) => setRazorpayPaymentId(e.target.value.trim())}
              />
              <p className="text-xs text-[#9CA3AF]">
                Copy it from Razorpay Dashboard → Transactions → Payments. The order is marked Paid, and the same
                payment can't be used for two orders.
              </p>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input type="checkbox" checked={markAsPaid} onChange={(e) => setMarkAsPaid(e.target.checked)} />
              Cash already collected (mark as Paid)
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Shipping charge (₹)</Label>
              <Input className={field} type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Discount (₹)</Label>
              <Input className={field} type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            {paymentMethod === "CASH" && (
              <div className="space-y-1.5">
                <Label>COD charge (₹)</Label>
                <Input className={field} type="number" min="0" value={codCharge} onChange={(e) => setCodCharge(e.target.value)} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Internal note (optional)</Label>
            <Input className={field} placeholder="e.g. Payment captured but verify timed out" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#374151]">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={triggerShiprocket} onChange={(e) => setTriggerShiprocket(e.target.checked)} />
              Send to Shiprocket (if booking mode is Auto)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sendCustomerEmail} onChange={(e) => setSendCustomerEmail(e.target.checked)} />
              Email confirmation to customer
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Summary + submit */}
      <Card className="border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm space-y-0.5 text-[#4B5563]">
            <p>Subtotal {formatCurrency(totals.subTotal)}</p>
            {totals.ship > 0 && <p>Shipping {formatCurrency(totals.ship)}</p>}
            {totals.cod > 0 && <p>COD charge {formatCurrency(totals.cod)}</p>}
            {totals.disc > 0 && <p className="text-emerald-600">Discount −{formatCurrency(totals.disc)}</p>}
            <p className="text-lg font-semibold text-[#1F2937] pt-1">Total {formatCurrency(totals.total)}</p>
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="h-11 px-8 bg-[#2E7D32] hover:bg-[#1B5E20] text-white">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…
              </>
            ) : (
              "Create Order"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
