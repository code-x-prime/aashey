import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Warehouse {
  id: string;
  name: string;
  label: string | null;
  pincode: string;
  city: string | null;
  state: string | null;
  isDefault: boolean;
  isActive: boolean;
}

const errorMessage = (err: unknown, fallback: string) =>
  err && typeof err === "object" && "response" in err
    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
    : fallback;

const EMPTY = { name: "", label: "", pincode: "", city: "", state: "" };

/** Pickup warehouses registered in Delhivery One. Independent of Shiprocket's pickup addresses. */
export default function DelhiveryWarehouses() {
  const [items, setItems] = useState<Warehouse[] | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get("/api/admin/delhivery/warehouses");
      setItems(r.data.data.warehouses);
    } catch (e) {
      toast.error(errorMessage(e, "Failed to load warehouses"));
      setItems([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    try {
      await fn();
      toast.success(ok);
      await load();
    } catch (e) {
      toast.error(errorMessage(e, "Request failed"));
    } finally {
      setBusy(null);
    }
  };

  const add = () =>
    act("add", async () => {
      await api.post("/api/admin/delhivery/warehouses", form);
      setForm(EMPTY);
    }, "Warehouse added");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pickup warehouses</CardTitle>
        <p className="text-xs text-slate-500">
          Use the exact name from Delhivery One (case-sensitive). You choose which one an order ships from when booking.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items === null ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">No warehouse yet. Add your first one below.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {items.map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {w.label || w.name}
                    {w.isDefault && <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">DEFAULT</span>}
                    {!w.isActive && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">INACTIVE</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {w.name} · {w.pincode}{w.city ? ` · ${w.city}` : ""}{w.state ? `, ${w.state}` : ""}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {!w.isDefault && w.isActive && (
                    <Button size="sm" variant="outline" disabled={!!busy} className="gap-1 text-xs"
                      onClick={() => act(`d${w.id}`, () => api.put(`/api/admin/delhivery/warehouses/${w.id}`, { isDefault: true }), "Default warehouse changed")}>
                      <Star className="h-3 w-3" /> Make default
                    </Button>
                  )}
                  {!w.isDefault && (
                    <Button size="sm" variant="outline" disabled={!!busy} className="text-xs"
                      onClick={() => act(`a${w.id}`, () => api.put(`/api/admin/delhivery/warehouses/${w.id}`, { isActive: !w.isActive }), w.isActive ? "Warehouse deactivated" : "Warehouse activated")}>
                      {w.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" disabled={!!busy} className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`Delete warehouse "${w.name}"?`)) act(`x${w.id}`, () => api.delete(`/api/admin/delhivery/warehouses/${w.id}`), "Warehouse deleted");
                    }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name in Delhivery One *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pune Warehouse" />
          </div>
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Pincode *</Label>
            <Input value={form.pincode} maxLength={6} inputMode="numeric" onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>
        </div>
        <Button onClick={add} disabled={busy === "add" || !form.name.trim() || form.pincode.length !== 6} className="gap-2">
          {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add warehouse
        </Button>
      </CardContent>
    </Card>
  );
}
