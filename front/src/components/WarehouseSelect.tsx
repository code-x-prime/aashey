import { Warehouse } from "lucide-react";

export interface WarehouseOption {
  id: string;
  label: string;
  pincode: string;
  isDefault?: boolean;
}

interface Props {
  warehouses: WarehouseOption[];
  /** "" means the default warehouse */
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

/** Choose which pickup warehouse a shipment leaves from. Hidden when there is only one. */
export default function WarehouseSelect({ warehouses, value, onChange, disabled }: Props) {
  if (warehouses.length < 2) return null;
  const effective = value || warehouses.find((w) => w.isDefault)?.id || warehouses[0].id;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
      <Warehouse className="h-4 w-4 text-slate-500 shrink-0" />
      <label className="text-xs font-semibold text-slate-600 shrink-0">Ship from</label>
      <select
        className="flex-1 min-w-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
        value={effective}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.label} · {w.pincode}
            {w.isDefault ? " (default)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
