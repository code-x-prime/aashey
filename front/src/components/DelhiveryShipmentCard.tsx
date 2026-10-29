import { useCallback, useEffect, useState } from "react";
import { Loader2, Truck, XCircle, Printer, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WarehouseSelect, { type WarehouseOption } from "@/components/WarehouseSelect";
import CourierOptions, { type ShiprocketCourier, type CourierChoices } from "@/components/CourierOptions";

interface Props {
  orderId: string;
  orderStatus: string;
  provider?: string | null;
  awbCode?: string | null;
  courierName?: string | null;
  deliverySpeed?: "SLOW" | "FAST" | null;
  courierRate?: number | null;
  shipmentStatus?: string | null;
  /** True when this order already has a Shiprocket AWB, so Delhivery must not be offered */
  bookedElsewhere: boolean;
  onChanged: () => void;
}

const errorMessage = (err: unknown, fallback: string) =>
  err && typeof err === "object" && "response" in err
    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
    : fallback;

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function printSlip(waybill: string, slip: Record<string, unknown>) {
  const w = window.open("", "_blank");
  if (!w) {
    toast.error("Popup blocked — allow popups for this site to print the label");
    return;
  }
  const barcode = typeof slip.barcode === "string" && slip.barcode ? `<img src="${esc(slip.barcode.startsWith("data:") ? slip.barcode : "data:image/png;base64," + slip.barcode)}" style="max-width:100%"/>` : "";
  const rows = Object.entries(slip)
    .filter(([k, v]) => k !== "barcode" && k !== "oid_barcode" && v !== null && typeof v !== "object" && String(v) !== "")
    .map(([k, v]) => `<tr><td style="color:#666;padding:2px 8px 2px 0">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join("");
  w.document.write(`<!doctype html><title>Delhivery label ${esc(waybill)}</title><body style="font-family:sans-serif;padding:16px;max-width:380px"><h2 style="margin:0 0 8px">Delhivery &middot; ${esc(waybill)}</h2>${barcode}<table style="font-size:13px;margin-top:8px">${rows}</table><script>window.onload=()=>window.print()</script></body>`);
  w.document.close();
}

/** Delhivery booking / label / tracking / cancel for one order. Hidden when Delhivery is off and unused. */
export default function DelhiveryShipmentCard({ orderId, orderStatus, provider, awbCode, courierName, deliverySpeed, courierRate, shipmentStatus, bookedElsewhere, onChanged }: Props) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [couriers, setCouriers] = useState<ShiprocketCourier[]>([]);
  const [choices, setChoices] = useState<CourierChoices | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [tracking, setTracking] = useState<{ status: string | null; location: string | null; scans: { time?: string; scan?: string; location?: string }[] } | null>(null);

  const isBooked = provider === "DELHIVERY" && !!awbCode;
  const canBook = !isBooked && !bookedElsewhere && orderStatus !== "CANCELLED";

  useEffect(() => {
    api
      .get("/api/admin/delhivery/settings")
      .then((r) => setEnabled(!!r.data.data.settings.isEnabled))
      .catch(() => setEnabled(false));
    api
      .get("/api/admin/delhivery/warehouses")
      .then((r) => setWarehouses((r.data.data.warehouses || []).filter((w: { isActive: boolean }) => w.isActive).map((w: { id: string; label?: string; name: string; pincode: string; isDefault: boolean }) => ({ id: w.id, label: w.label || w.name, pincode: w.pincode, isDefault: w.isDefault }))))
      .catch(() => setWarehouses([]));
  }, []);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/api/admin/delhivery/orders/${orderId}/options`, { params: warehouseId ? { warehouseId } : {} });
      const d = r.data.data;
      // Delhivery option ids are "S"/"E"; the shared card works with numbers, so map to 1/2
      const map = (c: ShiprocketCourier | null) => (c ? { ...c, id: c.speed === "FAST" ? 2 : 1 } : null);
      setSelected(null);
      const slow = map(d.options.slow);
      const fast = map(d.options.fast);
      setChoices({ slow, fast });
      setCouriers([slow, fast].filter(Boolean) as ShiprocketCourier[]);
    } catch (e) {
      setCouriers([]);
      setChoices(null);
      setError(errorMessage(e, "Could not fetch Delhivery rates"));
    } finally {
      setLoading(false);
    }
  }, [orderId, warehouseId]);

  useEffect(() => {
    if (enabled && canBook) loadOptions();
  }, [enabled, canBook, loadOptions]);

  if (enabled === null) return null;
  if (!enabled && !isBooked) return null;
  if (!isBooked && !canBook) return null;

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error(errorMessage(e, "Request failed"));
    } finally {
      setBusy(null);
    }
  };

  const book = () =>
    run("book", async () => {
      const speed = selected === "2" ? "FAST" : "SLOW";
      const r = await api.post(`/api/admin/delhivery/orders/${orderId}/book`, { speed, ...(warehouseId ? { warehouseId } : {}) });
      toast[r.data.data.pickupError ? "warning" : "success"](r.data.message);
      onChanged();
    });

  const label = () =>
    run("label", async () => {
      const r = await api.get(`/api/admin/delhivery/orders/${orderId}/label`);
      printSlip(r.data.data.waybill, r.data.data.slip);
    });

  const track = () =>
    run("track", async () => {
      const r = await api.get(`/api/admin/delhivery/orders/${orderId}/tracking`);
      setTracking(r.data.data);
    });

  const cancel = () => {
    if (!window.confirm("Cancel this Delhivery shipment? You can book again afterwards.")) return;
    run("cancel", async () => {
      await api.post(`/api/admin/delhivery/orders/${orderId}/cancel`);
      toast.success("Delhivery shipment cancelled");
      setTracking(null);
      onChanged();
    });
  };

  return (
    <Card className="border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
          <Truck className="h-4 w-4 text-red-700" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Delhivery Shipment</h3>
          <p className="text-[11px] text-slate-400 font-medium">Slow (Surface) / Fast (Express)</p>
        </div>
      </div>
      <CardContent className="px-6 py-6 space-y-4">
        {shipmentStatus === "DELHIVERY_CANCEL_FAILED" && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            <XCircle className="h-4 w-4 shrink-0" />
            This order was cancelled but Delhivery did not cancel the waybill. Cancel waybill {awbCode} in Delhivery One.
          </div>
        )}

        {isBooked ? (
          <>
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Waybill</p>
                <p className="font-mono text-xl font-black text-slate-800">{awbCode}</p>
              </div>
              <div className="text-xs text-slate-600">
                {courierName} {deliverySpeed && <b>· {deliverySpeed === "FAST" ? "Fast" : "Slow"}</b>}
                {courierRate != null && <> · rate <b>₹{courierRate}</b></>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={label} disabled={busy === "label"} className="gap-1.5">
                {busy === "label" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} Print label
              </Button>
              <Button variant="outline" size="sm" onClick={track} disabled={busy === "track"} className="gap-1.5">
                {busy === "track" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} Track
              </Button>
              <Button variant="outline" size="sm" onClick={cancel} disabled={busy === "cancel"} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel shipment
              </Button>
            </div>
            {tracking && (
              <div className="text-sm space-y-1.5 border-t pt-3">
                <p className="font-bold text-slate-800">{tracking.status}{tracking.location ? ` — ${tracking.location}` : ""}</p>
                {tracking.scans.slice(0, 8).map((s, i) => (
                  <p key={i} className="text-xs text-slate-500">{s.time} · {s.scan} {s.location ? `· ${s.location}` : ""}</p>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={loadOptions} disabled={loading} className="gap-1.5 text-xs text-slate-500">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh rates
              </Button>
            </div>
            <WarehouseSelect warehouses={warehouses} value={warehouseId} onChange={setWarehouseId} disabled={loading || busy === "book"} />
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : error ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            ) : (
              <>
                <CourierOptions couriers={couriers} options={choices} selectedId={selected ? Number(selected) : null} onSelect={(id) => setSelected(String(id))} />
                <Button onClick={book} disabled={!selected || busy === "book"} className="w-full h-11 font-bold gap-2">
                  {busy === "book" ? <><Loader2 className="h-4 w-4 animate-spin" />Booking…</> : <><Truck className="h-4 w-4" />Book with Delhivery</>}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
