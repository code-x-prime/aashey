"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/client-only";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResendVerificationPage() {
    const { resendVerification } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");

    // Check for stored email from registration
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedEmail = localStorage.getItem("registeredEmail");
            if (storedEmail) {
                setEmail(storedEmail);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setStatus("submitting");
        try {
            await resendVerification(email);
            setStatus("success");
            toast.success(
                "OTP sent successfully! Redirecting to verification...",
                {
                    duration: 3000,
                }
            );

            // Clear stored email
            if (typeof window !== "undefined") {
                localStorage.removeItem("registeredEmail");
            }

            // Redirect to verify-otp page
            setTimeout(() => {
                router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
            }, 1500);

        } catch (error) {
            setStatus("error");
            toast.error(error.message || "Failed to send verification email");
            // Reset status after showing error
            setTimeout(() => setStatus("idle"), 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDF6E3] py-12 px-4">
            <div className="max-w-md w-full">
                {/* Brand */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <h1 className="font-cormorant italic text-4xl font-bold text-[#C9933A]">AASHEY</h1>
                    </Link>
                    <p className="font-sc text-xs tracking-[0.2em] text-[#6B4423] uppercase mt-1">Pure A2 Cow Ghee</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(63,31,0,0.08)] border border-[#C9933A]/15 p-8">
                    <ClientOnly fallback={<div className="py-8 text-center font-sans text-[#7A4E2D]">Loading...</div>}>
                        {(status === "idle" || status === "error") && (
                            <div>
                                <div className="text-center mb-6">
                                    <div className="w-14 h-14 bg-[#C9933A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-7 h-7 text-[#C9933A]" />
                                    </div>
                                    <h1 className="font-cormorant text-2xl font-semibold text-[#3F1F00]">Resend OTP</h1>
                                    <p className="font-sans text-sm text-[#5C3A1E] mt-2">
                                        Enter your email address and we&apos;ll send a new 6-digit OTP.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block font-sans text-sm font-medium text-[#3F1F00] mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="brand-input"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3] font-sans font-semibold"
                                        disabled={status === "submitting"}
                                    >
                                        {status === "submitting" ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-[#FDF6E3]"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            "Send OTP"
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link href="/auth" className="font-sans text-sm text-[#C9933A] hover:text-[#3F1F00] font-medium">
                                        ← Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}

                        {status === "submitting" && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 font-sans text-sm text-[#5C3A1E]">
                                    Sending verification email...
                                </p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="rounded-full bg-[#092D15]/10 p-3">
                                    <CheckCircle className="h-12 w-12 text-[#092D15]" />
                                </div>
                                <p className="mt-4 font-sans text-sm font-semibold text-[#092D15]">
                                    OTP Sent Successfully!
                                </p>
                                <p className="mt-2 font-sans text-sm text-[#5C3A1E]">
                                    Taking you to enter the OTP...
                                </p>
                                <Link
                                    href={`/verify-otp?email=${encodeURIComponent(email)}`}
                                    className="btn-gold mt-6"
                                >
                                    Enter OTP Now <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </ClientOnly>
                </div>
            </div>
        </div>
    );
}
