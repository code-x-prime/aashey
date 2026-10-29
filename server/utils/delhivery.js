/**
 * Delhivery (Express API) client.
 * Docs: https://delhivery-express-api-doc.readme.io
 *
 * Slow = Surface (md=S), Fast = Express/air (md=E).
 * Every call goes through `request()` so errors come back as plain Error messages
 * the admin can read (never a raw HTML/stack dump).
 */

import { prisma } from "../config/db.js";
import { decrypt } from "./encryption.js";

const HOSTS = {
    PRODUCTION: "https://track.delhivery.com",
    STAGING: "https://staging-express.delhivery.com",
};

export async function getDelhiverySettings() {
    let settings = await prisma.delhiverySettings.findFirst();
    if (!settings) settings = await prisma.delhiverySettings.create({ data: {} });
    return settings;
}

export function resolveToken(settings) {
    if (!settings?.token) return null;
    const t = settings.token;
    return t.startsWith("enc:") ? decrypt(t.slice(4)) : t;
}

const baseUrl = (settings) => HOSTS[settings?.mode] || HOSTS.STAGING;

async function request(settings, path, { method = "GET", query, body, form } = {}) {
    const token = resolveToken(settings);
    if (!token) throw new Error("Delhivery API token is not configured");

    const url = new URL(baseUrl(settings) + path);
    if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));

    const headers = { Authorization: `Token ${token}`, Accept: "application/json" };
    let payload;
    if (form) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        payload = new URLSearchParams(form).toString();
    } else if (body) {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
    }

    let res;
    try {
        res = await fetch(url, { method, headers, body: payload, signal: AbortSignal.timeout(20000) });
    } catch (e) {
        throw new Error(`Could not reach Delhivery (${e.name === "TimeoutError" ? "timed out" : e.message})`);
    }

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* plain text body */ }

    if (res.status === 401 || res.status === 403) {
        throw new Error("Delhivery rejected the API token (check the token and that Staging/Production mode matches it)");
    }
    if (!res.ok) {
        const msg = data?.error || data?.rmk || data?.message || data?.detail || (typeof text === "string" ? text.slice(0, 200) : "");
        throw new Error(`Delhivery error ${res.status}${msg ? `: ${msg}` : ""}`);
    }
    return data;
}

/** Is this pincode deliverable (and COD/prepaid capable)? */
export async function checkPincode(settings, pin) {
    const data = await request(settings, "/c/api/pin-codes/json/", { query: { filter_codes: pin } });
    const entry = data?.delivery_codes?.[0]?.postal_code;
    if (!entry) return { serviceable: false, cod: false, prepaid: false, pin };
    return {
        serviceable: entry.pre_paid === "Y" || entry.cod === "Y",
        cod: entry.cod === "Y",
        prepaid: entry.pre_paid === "Y",
        oda: !!entry.is_oda,
        maxWeight: entry.max_weight ?? null,
        pin,
    };
}

/** Shipping charge for one mode. md: "S" surface | "E" express. */
export async function getCharge(settings, { md, weightKg, originPin, destPin }) {
    const grams = Math.max(1, Math.round(weightKg * 1000));
    const data = await request(settings, "/api/kinko/v1/invoice/charges/.json", {
        query: { md, cgm: grams, ss: "Delivered", o_pin: originPin, d_pin: destPin },
    });
    const row = Array.isArray(data) ? data[0] : data;
    const total = Number(row?.total_amount ?? row?.gross_amount);
    if (!row || !Number.isFinite(total) || total <= 0) return null;
    return { rate: Math.round(total * 100) / 100, zone: row.zone || null, chargedWeight: row.charged_weight ?? null };
}

/** Slow + Fast quote for a pincode pair. Missing/failed mode => null (UI says "not available"). */
export async function getDeliveryOptions(settings, { weightKg, originPin, destPin }) {
    const serv = await checkPincode(settings, destPin);
    if (!serv.serviceable) return { serviceable: false, cod: false, options: { slow: null, fast: null } };

    const one = async (md, speed, name) => {
        try {
            const c = await getCharge(settings, { md, weightKg, originPin, destPin });
            return c ? { id: md, name, rate: c.rate, speed, zone: c.zone, codAvailable: serv.cod, etd: null, etdDays: null } : null;
        } catch (e) {
            console.error(`[delhivery] charge ${md} failed:`, e.message);
            return null;
        }
    };
    const [slow, fast] = await Promise.all([
        one("S", "SLOW", "Delhivery Surface"),
        one("E", "FAST", "Delhivery Express"),
    ]);
    return { serviceable: true, cod: serv.cod, options: { slow, fast } };
}

const digits10 = (p) => String(p || "").replace(/\D/g, "").slice(-10);

/** Build the shipment object Delhivery's create API wants. */
export function buildShipment(order, { settings, weightKg, mode }) {
    const a = order.shippingAddress;
    if (!a) throw new Error("Order has no shipping address");
    const phone = digits10(a.phone || order.user?.phone);
    if (phone.length !== 10) throw new Error("Customer phone number must be 10 digits for Delhivery");

    const isCod = order.paymentMethod === "CASH";
    const total = Number(order.total ?? 0);
    const items = (order.items || []).map((i) => `${i.product?.name || "Item"} x${i.quantity}`).join(", ");

    return {
        name: a.name || order.user?.name || "Customer",
        add: a.street,
        pin: String(a.postalCode),
        city: a.city,
        state: a.state,
        country: a.country || "India",
        phone,
        order: order.orderNumber,
        payment_mode: isCod ? "COD" : "Prepaid",
        cod_amount: isCod ? total : 0,
        total_amount: total,
        products_desc: items.slice(0, 250),
        quantity: String((order.items || []).reduce((s, i) => s + i.quantity, 0) || 1),
        weight: String(Math.max(1, Math.round(weightKg * 1000))),
        shipping_mode: mode === "FAST" ? "Express" : "Surface",
        seller_name: settings.sellerName || undefined,
        hsn_code: settings.hsnCode || undefined,
    };
}

/** Create the shipment -> waybill. */
export async function createShipment(settings, shipment, pickupName = settings.pickupLocation) {
    if (!pickupName) throw new Error("No Delhivery pickup warehouse is set. Add one in Delhivery settings.");
    const data = await request(settings, "/api/cmu/create.json", {
        method: "POST",
        form: { format: "json", data: JSON.stringify({ shipments: [shipment], pickup_location: { name: pickupName } }) },
    });

    if (data?.error === true || data?.rmk) throw new Error(data.rmk || "Delhivery rejected the shipment");
    const pkg = data?.packages?.[0];
    if (!pkg) throw new Error("Delhivery returned no package for this order");
    if (pkg.status && String(pkg.status).toLowerCase() !== "success") {
        const r = Array.isArray(pkg.remarks) ? pkg.remarks.join(", ") : pkg.remarks;
        throw new Error(`Delhivery: ${r || pkg.status}`);
    }
    if (!pkg.waybill) throw new Error("Delhivery did not return a waybill");
    return { waybill: String(pkg.waybill), raw: pkg };
}

export async function getPackingSlip(settings, waybill) {
    const data = await request(settings, "/api/p/packing_slip", { query: { wbns: waybill, pdf: "false" } });
    const pkg = data?.packages?.[0];
    if (!pkg) throw new Error("Delhivery has no packing slip for this waybill yet");
    return pkg;
}

export async function trackShipment(settings, waybill) {
    const token = resolveToken(settings);
    if (!token) throw new Error("Delhivery API token is not configured");
    const data = await request(settings, "/api/v1/packages/json/", { query: { waybill, token } });
    const s = data?.ShipmentData?.[0]?.Shipment;
    if (!s) throw new Error("No tracking data yet for this waybill");
    return {
        status: s.Status?.Status || null,
        statusType: s.Status?.StatusType || null,
        location: s.Status?.StatusLocation || null,
        instructions: s.Status?.Instructions || null,
        updatedAt: s.Status?.StatusDateTime || null,
        scans: (s.Scans || []).map((x) => x.ScanDetail).filter(Boolean).map((d) => ({
            time: d.ScanDateTime || d.StatusDateTime, scan: d.Scan, location: d.ScannedLocation, note: d.Instructions,
        })),
    };
}

export async function cancelShipment(settings, waybill) {
    const data = await request(settings, "/api/p/edit", { method: "POST", body: { waybill, cancellation: "true" } });
    if (data && data.status === false) throw new Error(data.remark || "Delhivery could not cancel this shipment");
    return data;
}

export async function requestPickup(settings, { date, time = "14:00:00", count = 1, pickupLocation = settings.pickupLocation }) {
    if (!pickupLocation) throw new Error("No Delhivery pickup warehouse is set. Add one in Delhivery settings.");
    return request(settings, "/fm/request/new/", {
        method: "POST",
        body: { pickup_time: time, pickup_date: date, pickup_location: pickupLocation, expected_package_count: count },
    });
}
