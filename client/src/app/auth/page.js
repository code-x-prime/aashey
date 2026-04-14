"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

/* ── react-icons ─────────────────────────────── */
import { RiMailLine } from "react-icons/ri";
import { RiLockPasswordLine } from "react-icons/ri";
import { RiUser3Line } from "react-icons/ri";
import { RiPhoneLine } from "react-icons/ri";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { RiLoader4Line } from "react-icons/ri";
import { RiCheckLine } from "react-icons/ri";
import { RiArrowLeftLine } from "react-icons/ri";
import { RiLeafLine } from "react-icons/ri";
import { RiShieldCheckLine } from "react-icons/ri";
import { RiAwardLine } from "react-icons/ri";

/* ============================= */
/*           AUTH FORM           */
/* ============================= */

function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const tabFromUrl = searchParams.get("tab") || "login";
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    useEffect(() => { setActiveTab(tabFromUrl); }, [tabFromUrl]);

    useEffect(() => {
        if (isAuthenticated) router.push("/");
    }, [isAuthenticated, router]);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        router.push(`/auth?tab=${tab}`, { scroll: false });
    };

    const perks = [
        { icon: RiCheckLine, text: "100% Pure A2 Ghee" },
        { icon: RiLeafLine, text: "Bilona Method Churned" },
        { icon: RiShieldCheckLine, text: "Lab Certified Quality" },
        { icon: RiAwardLine, text: "Free Delivery above ₹999" },
    ];

    return (
        <div className="min-h-screen bg-[#FDF6E3] flex items-stretch">

            {/* ── LEFT PANEL ─────────────────────────── */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#3F1F00] flex-col items-center justify-center p-14 relative overflow-hidden">
                {/* Decorative rings */}
                <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full border border-[#C9933A]/10" />
                <div className="absolute top-[-40px] right-[-40px] w-[240px] h-[240px] rounded-full border border-[#C9933A]/15" />
                <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full border border-[#FDF6E3]/5" />

                <div className="relative z-10 text-center max-w-xs">
                    {/* Brand */}
                    <div className="mb-10">
                        <p className="text-[10px] tracking-[0.35em] font-sans font-medium text-[#C9933A]/60 uppercase mb-3">
                            Welcome to
                        </p>
                        <h1 className="text-6xl font-cormorant italic font-bold text-[#C9933A] tracking-tight leading-none">
                            Aashey
                        </h1>
                        <div className="w-10 h-px bg-[#C9933A]/40 mx-auto my-4" />
                        <p className="font-cormorant italic text-[#FDF6E3]/70 text-lg">
                            Pure A2 Cow Ghee
                        </p>
                    </div>

                    {/* Ghee Pot Illustration */}
                    <div className="my-10 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-[#C9933A]/10 border border-[#C9933A]/20 flex items-center justify-center text-5xl">
                            🏺
                        </div>
                    </div>

                    {/* Perks */}
                    <div className="space-y-3.5 text-left mt-8">
                        {perks.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#C9933A]/20 border border-[#C9933A]/30 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-3 h-3 text-[#C9933A]" />
                                </div>
                                <span className="font-sans text-[13px] text-[#FDF6E3]/75">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-[420px]">

                    {/* Mobile Brand */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-4xl font-cormorant italic font-bold text-[#C9933A]">
                            Aashey
                        </h1>
                        <div className="w-8 h-px bg-[#C9933A]/40 mx-auto my-2" />
                        <p className="font-sans text-[11px] tracking-[0.2em] text-[#8B6040] uppercase">
                            Pure A2 Cow Ghee
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-[0_8px_48px_rgba(63,31,0,0.10)] border border-[#C9933A]/12 overflow-hidden">

                        {/* Tabs */}
                        <div className="flex border-b border-[#C9933A]/15 bg-[#FDF6E3]/50">
                            {["login", "register"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`flex-1 py-4 text-[11px] font-sans font-semibold tracking-[0.18em] uppercase transition-all duration-200 ${activeTab === tab
                                            ? "text-[#3F1F00] border-b-2 border-[#C9933A] bg-white"
                                            : "text-[#8B6040] hover:text-[#5C3A1E] hover:bg-[#FDF6E3]"
                                        }`}
                                >
                                    {tab === "login" ? "Sign In" : "Register"}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 pt-7">
                            {activeTab === "login" && <LoginForm />}
                            {activeTab === "register" && <RegisterForm />}
                        </div>
                    </div>

                    {/* Back link */}
                    <p className="text-center mt-5">
                        <Link href="/" className="inline-flex items-center gap-1.5 font-sans text-[13px] text-[#8B6040] hover:text-[#C9933A] transition-colors">
                            <RiArrowLeftLine className="w-3.5 h-3.5" />
                            Continue Shopping
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ============================= */
/*           LOGIN FORM          */
/* ============================= */

function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error("Email and password are required"); return; }
        setIsSubmitting(true);
        try {
            await login(email, password);
            toast.success("Welcome back!");
            const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect");
            router.push(returnUrl ? decodeURIComponent(returnUrl) : "/");
        } catch (error) {
            toast.error(error?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-6">
                <h2 className="font-cormorant text-[28px] font-semibold text-[#3F1F00] leading-tight">
                    Welcome back
                </h2>
                <p className="font-sans text-[13px] text-[#8B6040] mt-1">
                    Sign in to your Aashey account
                </p>
            </div>

            <AuthInput
                icon={<RiMailLine className="w-[17px] h-[17px]" />}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
            />

            <div className="space-y-1.5">
                <label className="block font-sans text-[12px] font-medium text-[#5C3A1E] tracking-wide">
                    Password
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9933A]/60 pointer-events-none">
                        <RiLockPasswordLine className="w-[17px] h-[17px]" />
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        className="w-full h-11 pl-10 pr-11 border border-[#C9933A]/25 rounded-xl bg-[#FDF6E3]/60 font-sans text-[13.5px] text-[#3F1F00] placeholder:text-[#B89070] focus:border-[#C9933A] focus:ring-2 focus:ring-[#C9933A]/15 outline-none transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B89070] hover:text-[#C9933A] transition-colors"
                    >
                        {showPassword
                            ? <RiEyeOffLine className="w-[17px] h-[17px]" />
                            : <RiEyeLine className="w-[17px] h-[17px]" />
                        }
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3] font-sans text-[13px] font-semibold tracking-wide transition-all duration-200 mt-2 flex items-center justify-center gap-2"
            >
                {isSubmitting
                    ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> Signing in...</>
                    : "Sign In"
                }
            </Button>

            <p className="text-center font-sans text-[13px] text-[#8B6040] pt-1">
                New here?{" "}
                <button
                    type="button"
                    onClick={() => router.push("/auth?tab=register")}
                    className="font-semibold text-[#C9933A] hover:text-[#3F1F00] transition-colors"
                >
                    Create account →
                </button>
            </p>
        </form>
    );
}

/* ============================= */
/*         REGISTER FORM         */
/* ============================= */

function RegisterForm() {
    const { register } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", password: "", confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match"); return;
        }
        setIsSubmitting(true);
        try {
            await register(formData);
            toast.success("Account created!");
            router.push(`/verify-otp?email=${formData.email}`);
        } catch (error) {
            toast.error(error?.message || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-5">
                <h2 className="font-cormorant text-[26px] font-semibold text-[#3F1F00] leading-tight">
                    Create account
                </h2>
                <p className="font-sans text-[13px] text-[#8B6040] mt-1">
                    Join the Aashey family
                </p>
            </div>

            <AuthInput
                icon={<RiUser3Line className="w-[17px] h-[17px]" />}
                name="name" placeholder="Full Name"
                value={formData.name} onChange={handleChange} label="Full Name"
            />
            <AuthInput
                icon={<RiMailLine className="w-[17px] h-[17px]" />}
                name="email" type="email" placeholder="Email Address"
                value={formData.email} onChange={handleChange} label="Email"
            />
            <AuthInput
                icon={<RiPhoneLine className="w-[17px] h-[17px]" />}
                name="phone" placeholder="Phone Number"
                value={formData.phone} onChange={handleChange} label="Phone"
            />

            {/* Password */}
            <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />

            {/* Confirm Password — no toggle, just lock icon */}
            <div className="space-y-1.5">
                <label className="block font-sans text-[12px] font-medium text-[#5C3A1E] tracking-wide">
                    Confirm Password
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9933A]/60 pointer-events-none">
                        <RiLockPasswordLine className="w-[17px] h-[17px]" />
                    </span>
                    <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="w-full h-11 pl-10 pr-4 border border-[#C9933A]/25 rounded-xl bg-[#FDF6E3]/60 font-sans text-[13.5px] text-[#3F1F00] placeholder:text-[#B89070] focus:border-[#C9933A] focus:ring-2 focus:ring-[#C9933A]/15 outline-none transition-all"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3] font-sans text-[13px] font-semibold tracking-wide transition-all duration-200 mt-1 flex items-center justify-center gap-2"
            >
                {isSubmitting
                    ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> Creating...</>
                    : "Create Account"
                }
            </Button>
        </form>
    );
}

/* ============================= */
/*        REUSABLE FIELDS        */
/* ============================= */

function AuthInput({ icon, type = "text", value, onChange, placeholder, name, label }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block font-sans text-[12px] font-medium text-[#5C3A1E] tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9933A]/60 pointer-events-none">
                    {icon}
                </span>
                <input
                    type={type}
                    name={name}
                    required
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full h-11 pl-10 pr-4 border border-[#C9933A]/25 rounded-xl bg-[#FDF6E3]/60 font-sans text-[13.5px] text-[#3F1F00] placeholder:text-[#B89070] focus:border-[#C9933A] focus:ring-2 focus:ring-[#C9933A]/15 outline-none transition-all"
                />
            </div>
        </div>
    );
}

function PasswordInput({ label, name, value, onChange, showPassword, setShowPassword }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block font-sans text-[12px] font-medium text-[#5C3A1E] tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9933A]/60 pointer-events-none">
                    <RiLockPasswordLine className="w-[17px] h-[17px]" />
                </span>
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    required
                    value={value}
                    onChange={onChange}
                    placeholder="Password"
                    className="w-full h-11 pl-10 pr-11 border border-[#C9933A]/25 rounded-xl bg-[#FDF6E3]/60 font-sans text-[13.5px] text-[#3F1F00] placeholder:text-[#B89070] focus:border-[#C9933A] focus:ring-2 focus:ring-[#C9933A]/15 outline-none transition-all"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B89070] hover:text-[#C9933A] transition-colors"
                >
                    {showPassword
                        ? <RiEyeOffLine className="w-[17px] h-[17px]" />
                        : <RiEyeLine className="w-[17px] h-[17px]" />
                    }
                </button>
            </div>
        </div>
    );
}

/* ============================= */
/*         PAGE EXPORT           */
/* ============================= */

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FDF6E3]">
                <div className="text-center">
                    <p className="font-cormorant italic text-3xl text-[#C9933A]">Aashey</p>
                    <p className="font-sans text-xs text-[#8B6040] mt-2 tracking-widest uppercase">Loading...</p>
                </div>
            </div>
        }>
            <AuthForm />
        </Suspense>
    );
}