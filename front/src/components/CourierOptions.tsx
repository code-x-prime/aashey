import { useState } from "react";
import { Bike, Plane, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShiprocketCourier {
  id: number;
  name: string;
  rate: number;
  etd: string;
  etdDays?: number | null;
  codAvailable: boolean;
  speed?: "SLOW" | "FAST" | null;
}

export interface CourierChoices {
  slow: ShiprocketCourier | null;
  fast: ShiprocketCourier | null;
}

interface Props {
  couriers: ShiprocketCourier[];
  options?: CourierChoices | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/**
 * Delivery choice for the admin: two clear options — Slow (surface, cheaper) and
 * Fast (air, quicker) — each showing the live Shiprocket price and delivery date.
 * Every other serviceable courier stays one click away under "More couriers".
 */
export default function CourierOptions({ couriers, options, selectedId, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false);

  const slow = options?.slow ?? null;
  const fast = options?.fast ?? null;
  const featuredIds = new Set([slow?.id, fast?.id].filter((v): v is number => typeof v === "number"));
  const others = couriers.filter((c) => !featuredIds.has(c.id));

  // The selected courier might be one of the "more" ones — keep that list open so the choice is visible
  const selectedInOthers = others.some((c) => c.id === selectedId);

  const cards = [
    {
      key: "slow",
      title: "Slow Delivery",
      subtitle: "Surface · lowest price",
      Icon: Bike,
      courier: slow,
      tone: "emerald",
    },
    {
      key: "fast",
      title: "Fast Delivery",
      subtitle: "Air · quicker delivery",
      Icon: Plane,
      courier: fast,
      tone: "sky",
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ key, title, subtitle, Icon, courier, tone }) => {
          const selected = !!courier && selectedId === courier.id;
          if (!courier) {
            return (
              <div
                key={key}
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 opacity-70"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <Icon className="h-4 w-4" />
                  <p className="text-sm font-bold">{title}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2">Not available for this pincode</p>
              </div>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(courier.id)}
              className={cn(
                "text-left rounded-2xl border p-4 transition-all hover:shadow-sm",
                selected
                  ? tone === "emerald"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                    : "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", tone === "emerald" ? "text-emerald-600" : "text-sky-600")} />
                    <p className="text-sm font-black text-slate-800">{title}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-slate-800">₹{courier.rate}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Shiprocket rate</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-700">{courier.name}</p>
                <p className="text-xs text-slate-500">
                  Delivery by <span className="font-semibold text-slate-700">{courier.etd}</span>
                  {courier.etdDays ? <span className="text-slate-400"> · {courier.etdDays} day{courier.etdDays === 1 ? "" : "s"}</span> : null}
                </p>
                {courier.codAvailable && (
                  <span className="inline-block text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md font-bold">
                    COD
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {others.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", (showAll || selectedInOthers) && "rotate-180")} />
            More couriers ({others.length})
          </button>
          {(showAll || selectedInOthers) && (
            <div className="mt-2 space-y-2">
              {others.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:border-amber-300",
                    selectedId === c.id ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20" : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="courier-more"
                      checked={selectedId === c.id}
                      onChange={() => onSelect(c.id)}
                      className="h-4 w-4 accent-amber-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {c.name}
                        {c.speed && (
                          <span className="ml-2 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {c.speed === "FAST" ? "FAST" : "SLOW"}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">Delivery by {c.etd}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-slate-800 shrink-0">₹{c.rate}</p>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
