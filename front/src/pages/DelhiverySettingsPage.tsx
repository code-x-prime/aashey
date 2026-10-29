import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

interface Settings {
  isEnabled: boolean;
  token: string | null;
  mode: "STAGING" | "PRODUCTION";
  pickupLocation: string | null;
  sellerName: string | null;
  hsnCode: string | null;
  defaultWeight: number;
}

const errorMessage = (err: unknown, fallback: string) =>
  err && typeof err === "object" && "response" in err
    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
    : fallback;

export default function DelhiverySettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api
      .get("/api/admin/delhivery/settings")
      .then((r) => setSettings(r.data.data.settings))
      .catch((e) => toast.error(errorMessage(e, "Failed to load Delhivery settings")));
  }, []);

  if (!settings) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.put("/api/admin/delhivery/settings", {
        isEnabled: settings.isEnabled,
        mode: settings.mode,
        pickupLocation: settings.pickupLocation ?? "",
        sellerName: settings.sellerName ?? "",
        hsnCode: settings.hsnCode ?? "",
        defaultWeight: settings.defaultWeight,
        ...(token.trim() ? { token: token.trim() } : {}),
      });
      setSettings(r.data.data.settings);
      setToken("");
      toast.success("Delhivery settings saved");
    } catch (e) {
      toast.error(errorMessage(e, "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    try {
      const r = await api.post("/api/admin/delhivery/test-connection");
      toast.success(`Connected to Delhivery (${r.data.data.mode})`);
    } catch (e) {
      toast.error(errorMessage(e, "Connection failed"));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-amber-700" />
        <h1 className="text-xl font-bold text-slate-800">Delhivery Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Delhivery</Label>
              <p className="text-xs text-slate-500">Adds Delhivery Slow / Fast options on order pages.</p>
            </div>
            <Switch checked={settings.isEnabled} onCheckedChange={(v) => set("isEnabled", v)} />
          </div>

          <div className="space-y-1.5">
            <Label>Mode</Label>
            <select
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={settings.mode}
              onChange={(e) => set("mode", e.target.value as Settings["mode"])}
            >
              <option value="STAGING">Staging (testing, no real shipments)</option>
              <option value="PRODUCTION">Production (live)</option>
            </select>
            <p className="text-xs text-slate-500">A staging token only works in Staging, a live token only in Production.</p>
          </div>

          <div className="space-y-1.5">
            <Label>API token</Label>
            <Input
              type="password"
              placeholder={settings.token ? "Saved — type to replace" : "Paste Delhivery API token"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Pickup location name</Label>
            <Input
              placeholder="Exactly as registered in Delhivery One"
              value={settings.pickupLocation ?? ""}
              onChange={(e) => set("pickupLocation", e.target.value)}
            />
            <p className="text-xs text-slate-500">Case-sensitive. A wrong name makes every booking fail.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipment defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Seller name</Label>
            <Input value={settings.sellerName ?? ""} onChange={(e) => set("sellerName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>HSN code</Label>
            <Input value={settings.hsnCode ?? ""} onChange={(e) => set("hsnCode", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Default weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={settings.defaultWeight}
              onChange={(e) => set("defaultWeight", parseFloat(e.target.value) || 0.5)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Save settings
        </Button>
        <Button variant="outline" onClick={test} disabled={testing || !settings.token}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test connection"}
        </Button>
      </div>
      <p className="text-xs text-slate-500">Save first, then test — the test uses the saved token.</p>
    </div>
  );
}
