"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { Shield } from "lucide-react";

function VerifyOtpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyOtp, resendVerification } = useAuth();

    const initialEmail = useMemo(
        () => searchParams.get("email") || "",
        [searchParams]
    );
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        setEmail(initialEmail);
    }, [initialEmail]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Email is required");
        if (!/^\d{6}$/.test(otp)) return toast.error("Enter 6-digit OTP");

        setIsSubmitting(true);
        try {
            await verifyOtp(email, otp);
            toast.success("Verification successful! Logging you in...");

            // Give context state a moment to update
            setTimeout(() => {
                router.push("/");
            }, 500);
        } catch (err) {
            toast.error(err.message || "Failed to verify OTP");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!email) return toast.error("Enter your email to resend OTP");
        try {
            await resendVerification(email);
            toast.success("OTP sent to your email");
            setResendCooldown(30);
        } catch (err) {
            toast.error(err.message || "Failed to resend OTP");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDF6E3] py-12 px-4">
            <Toaster position="top-center" />
            <div className="max-w-md w-full">
                {/* Brand */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <h1 className="font-cormorant italic text-4xl font-bold text-[#C9933A]">AASHEY</h1>
                    </Link>
                    <p className="font-sc text-xs tracking-[0.2em] text-[#6B4423] uppercase mt-1">Pure A2 Cow Ghee</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(63,31,0,0.08)] border border-[#C9933A]/15 p-8 space-y-6">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-[#C9933A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-7 h-7 text-[#C9933A]" />
                        </div>
                        <h1 className="font-cormorant text-2xl font-semibold text-[#3F1F00]">Verify Email</h1>
                        <p className="font-sans text-sm text-[#5C3A1E] mt-2">
                            Enter the 6-digit OTP sent to your email
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleVerify}>
                        <div>
                            <label htmlFor="email" className="block font-sans text-sm font-medium text-[#3F1F00] mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="brand-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="otp" className="block font-sans text-sm font-medium text-[#3F1F00] mb-1.5">
                                One-Time Password (OTP)
                            </label>
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                pattern="\d{6}"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                                placeholder="Enter 6-digit OTP"
                                required
                                className="brand-input text-center font-cormorant text-2xl tracking-[0.5em]"
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3] font-sans font-semibold" disabled={isSubmitting}>
                            {isSubmitting ? "Verifying..." : "Verify"}
                        </Button>
                    </form>

                    <div className="flex items-center justify-between font-sans text-sm">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="text-[#C9933A] hover:text-[#3F1F00] font-medium disabled:text-[#8B6040]"
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                        </button>
                        <Link href="/auth" className="text-[#5C3A1E] hover:text-[#3F1F00]">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FDF6E3]">
                <div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <VerifyOtpContent />
        </Suspense>
    );
}
