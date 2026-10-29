import { useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  orderId: string;
  onDone: () => void;
}

/**
 * For an unpaid order whose customer paid outside the website — personal UPI/bank, or a
 * Razorpay link. Enter the Razorpay Payment ID or any reference and the order becomes Paid.
 */
export default function RecordPaymentCard({ orderId, onDone }: Props) {
  const [razorpayPaymentId, setRazorpayPaymentId] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = razorpayPaymentId.trim() !== "" || reference.trim() !== "";

  const save = async () => {
    if (!window.confirm("Mark this order as paid? Shipping may start automatically.")) return;
    setSaving(true);
    try {
      const r = await api.post(`/api/admin/orders/${orderId}/mark-paid`, {
        razorpayPaymentId: razorpayPaymentId.trim() || undefined,
        reference: reference.trim() || undefined,
      });
      toast.success(r.data.message || "Payment recorded");
      setRazorpayPaymentId("");
      setReference("");
      onDone();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Could not record the payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-amber-100 rounded-2xl shadow-sm bg-white">
      <CardContent className="px-6 py-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Wallet className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Payment not received on the website?</h3>
            <p className="text-[11px] text-slate-400 font-medium">Customer paid personally / via a Razorpay link or UPI — record it here</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Razorpay Payment ID</Label>
            <Input placeholder="pay_XXXXXXXXXXXXXX" value={razorpayPaymentId} onChange={(e) => setRazorpayPaymentId(e.target.value.trim())} />
          </div>
          <div className="space-y-1.5">
            <Label>…or payment reference</Label>
            <Input placeholder="UTR / UPI ref / paid to whom" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        </div>
        <Button onClick={save} disabled={!canSave || saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Mark as paid
        </Button>
      </CardContent>
    </Card>
  );
}
