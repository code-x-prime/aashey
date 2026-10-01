"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, XCircle } from "lucide-react";
import { INDIAN_STATES } from "@/lib/indianStates";
import { usePincodeLookup } from "@/lib/usePincodeLookup";

export default function AddressForm({ onSuccess, onCancel, existingAddress = null, isInline = false }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: existingAddress?.name || "",
        street: existingAddress?.street || "",
        city: existingAddress?.city || "",
        state: existingAddress?.state || "",
        postalCode: existingAddress?.postalCode || "",
        country: existingAddress?.country || "India",
        phone: existingAddress?.phone || "",
        isDefault: existingAddress?.isDefault || false,
    });
    const [errors, setErrors] = useState({});

    // Auto-fill City/State from the Postal Code — same lookup used at guest
    // checkout, so a typed pincode fills these in instead of relying on the
    // customer to type (and possibly mistype) a city/state name.
    const { lookupPincode } = usePincodeLookup();
    const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false);

    useEffect(() => {
        const pin = String(formData.postalCode || "").replace(/\D/g, "");
        if (pin.length !== 6) return;

        let cancelled = false;
        const timer = setTimeout(async () => {
            setPincodeLookupLoading(true);
            const result = await lookupPincode(pin);
            if (!cancelled && result) {
                setFormData((prev) => ({
                    ...prev,
                    city: result.city || prev.city,
                    state: result.state || prev.state,
                }));
                setErrors((prev) => ({ ...prev, city: "", state: "" }));
            }
            if (!cancelled) setPincodeLookupLoading(false);
        }, 400);

        return () => { cancelled = true; clearTimeout(timer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.postalCode]);

    const validations = {
        name: (value) => !value.trim() ? "Name is required" : value.length < 2 ? "Name must be at least 2 characters" : "",
        phone: (value) => !value.trim() ? "Phone number is required" : !/^[0-9]{10}$/.test(value) ? "Enter valid 10-digit phone number" : "",
        postalCode: (value) => !value.trim() ? "Postal code is required" : !/^[0-9]{6}$/.test(value) ? "Enter valid 6-digit postal code" : "",
        street: (value) => !value.trim() ? "Street address is required" : "",
        city: (value) => !value.trim() ? "City is required" : "",
        state: (value) => !value.trim() ? "State is required" : "",
        country: (value) => !value.trim() ? "Country is required" : "",
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        const validationError = validations[name]?.(newValue) || "";
        setErrors(prev => ({ ...prev, [name]: validationError }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(validations).forEach(field => {
            const error = validations[field](formData[field]);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) { toast.error("Please fix the errors in the form"); return; }
        setLoading(true);
        try {
            const endpoint = existingAddress ? `/users/addresses/${existingAddress.id}` : "/users/addresses";
            const method = existingAddress ? "PATCH" : "POST";
            const response = await fetchApi(endpoint, { method, credentials: "include", body: JSON.stringify(formData) });
            if (!response.success) throw new Error(response.message || `Failed to ${existingAddress ? 'update' : 'add'} address`);
            toast.success(`Address ${existingAddress ? 'updated' : 'added'} successfully`);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to save address");
            setErrors(prev => ({ ...prev, general: error.message }));
        } finally { setLoading(false); }
    };

    const renderField = (name, label, placeholder, props = {}) => (
        <div className={props.className || ""}>
            <Label htmlFor={name}>{label}*</Label>
            <Input id={name} name={name} value={formData[name]} onChange={handleChange} className={errors[name] ? "border-red-500" : ""} placeholder={placeholder} {...props} />
            {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
        </div>
    );

    return (
        <div className={isInline ? "p-4 border rounded-lg mb-4" : ""}>
            {isInline && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Add New Address</h3>
                    <button onClick={onCancel} className="text-[#6B4423] hover:text-[#3F1F00]"><XCircle className="h-5 w-5" /></button>
                </div>
            )}
            {errors.general && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{errors.general}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderField("name", "Full Name", "Enter your full name", { className: "sm:col-span-2 lg:col-span-3" })}
                    {renderField("street", "Street Address", "House number, Street, Apartment, etc.", { className: "sm:col-span-2 lg:col-span-3" })}

                    {/* Postal Code first — drives the City/State auto-fill below */}
                    <div>
                        <Label htmlFor="postalCode">Postal Code*</Label>
                        <div className="relative">
                            <Input
                                id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange}
                                className={errors.postalCode ? "border-red-500" : ""} placeholder="Enter 6-digit postal code"
                                maxLength={6} inputMode="numeric"
                            />
                            {pincodeLookupLoading && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                        {errors.postalCode
                            ? <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                            : <p className="text-xs text-muted-foreground mt-1">City &amp; state fill in automatically</p>}
                    </div>

                    {renderField("city", "City", "Enter city")}

                    {/* State — dropdown to avoid typos that break delivery/courier booking */}
                    <div>
                        <Label htmlFor="state">State*</Label>
                        <select
                            id="state" name="state" value={formData.state} onChange={handleChange}
                            className={`flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${errors.state ? "border-red-500" : "border-input"}`}
                        >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>

                    {renderField("phone", "Phone Number", "Enter 10-digit phone number", { maxLength: 10 })}
                    {renderField("country", "Country", "Enter country", { className: "sm:col-span-2" })}
                    <div className="lg:col-span-3">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <Label htmlFor="isDefault" className="font-normal cursor-pointer">Set as default address</Label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    {onCancel && <Button type="button" onClick={onCancel} variant="outline" disabled={loading}>Cancel</Button>}
                    <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{existingAddress ? "Update Address" : "Save Address"}</Button>
                </div>
            </form>
        </div>
    );
}
