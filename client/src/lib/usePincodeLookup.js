"use client";

import { useRef } from "react";

/**
 * Looks up city + state for a 6-digit Indian postal code using India Post's
 * public PIN code API, the same kind of lookup Shopify-style checkouts use
 * to auto-fill city/state so the customer never has to type (or mistype)
 * them. Pure lookup helper — safe to call from anywhere, never throws.
 *
 * Returns null (quietly) if the pincode is invalid, not found, or the
 * lookup fails for any reason — callers should treat city/state as still
 * editable by hand when that happens.
 */
export function usePincodeLookup() {
  // Dedupe + cancel stale lookups when the user keeps typing
  const lastRequestId = useRef(0);

  const lookupPincode = async (pincode) => {
    const clean = String(pincode || "").replace(/\D/g, "");
    if (clean.length !== 6) return null;

    const requestId = ++lastRequestId.current;

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return null;

      const data = await res.json();
      // Stale response — a newer lookup has since started
      if (requestId !== lastRequestId.current) return null;

      const result = Array.isArray(data) ? data[0] : null;
      if (!result || result.Status !== "Success" || !result.PostOffice?.length) {
        return null;
      }

      const po = result.PostOffice[0];
      return {
        city: po.District || po.Block || po.Name || "",
        state: po.State || "",
      };
    } catch {
      // Network error, timeout, or malformed response — fail silently,
      // the customer can still type city/state manually.
      return null;
    }
  };

  return { lookupPincode };
}
