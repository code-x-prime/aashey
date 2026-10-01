"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Mail } from "lucide-react";

function ForgotPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { forgotPassword, loading } = useAuth();
    const prefillEmail = searchParams.get("email") || "";
    const [email, setEmail] = useState(prefillEmail);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (prefillEmail) setEmail(prefillEmail);
    }, [prefillEmail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            await forgotPassword(email);
            toast.success(
                "If your email is registered, you will receive a password reset link"
            );
            router.push(`/auth?tab=login&email=${encodeURIComponent(email)}`);
        } catch (err) {
            toast.error(err.message || "Failed to request password reset");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDF6E3] py-12 px-4">
            <div className="max-w-md w-full">
                {/* Brand */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <h1 className="font-sans italic text-4xl font-bold text-[#C9933A]">AASHEY</h1>
                    </Link>
                    <p className="font-sans text-xs tracking-[0.2em] text-[#6B4423] uppercase mt-1">Pure A2 Cow Ghee</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(63,31,0,0.08)] border border-[#C9933A]/15 p-8">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-[#C9933A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-7 h-7 text-[#C9933A]" />
                        </div>
                        <h1 className="font-sans text-2xl font-semibold text-[#3F1F00]">Forgot Password</h1>
                        <p className="font-sans text-sm text-[#5C3A1E] mt-2">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block font-sans text-sm font-medium text-[#3F1F00] mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="brand-input"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={submitting || loading}
                            className="w-full h-12 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3] font-sans font-semibold"
                        >
                            {submitting || loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/auth" className="font-sans text-sm text-[#C9933A] hover:text-[#3F1F00] font-medium">
                            ? Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FDF6E3]">
                <div className="text-center">
                    <p className="font-sans italic text-3xl text-[#C9933A]">Aashey</p>
                    <p className="font-sans text-xs text-[#8B6040] mt-2 tracking-widest uppercase">Loading...</p>
                </div>
            </div>
        }>
            <ForgotPasswordForm />
        </Suspense>
    );
}
