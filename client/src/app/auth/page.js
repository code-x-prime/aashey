"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    User,
    Phone,
    Eye,
    EyeOff,
    Loader2,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

/* ============================= */
/*           AUTH FORM           */
/* ============================= */

function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const tabFromUrl = searchParams.get("tab") || "login";
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    useEffect(() => {
        setActiveTab(tabFromUrl);
    }, [tabFromUrl]);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        router.push(`/auth?tab=${tab}`, { scroll: false });
    };

    return (
        <div className="min-h-screen bg-[#FDF6E3] flex items-stretch">
            {/* LEFT PANEL */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3F1F00] to-[#092D15] flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9933A]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#092D15]/20 rounded-full blur-3xl" />

                <div className="relative z-10 text-center max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-5xl font-cormorant italic font-bold text-[#C9933A] tracking-tight mb-2">
                            AASHEY
                        </h1>
                        <p className="text-[#FDF6E3]/90 text-lg font-cormorant italic">
                            Pure A2 Cow Ghee
                        </p>
                        <p className="font-sc text-xs tracking-[0.3em] text-[#FDF6E3]/75 uppercase mt-1">
                            Traditionally Bilona Crafted
                        </p>
                    </div>

                    <div className="my-12 text-6xl">🏺</div>

                    <div className="space-y-4 mt-12">
                        {[
                            "100% Pure A2 Ghee",
                            "Bilona Method Churned",
                            "Lab Certified Quality",
                        ].map((text) => (
                            <div key={text} className="flex items-center gap-3 text-left">
                                <div className="w-6 h-6 rounded-full bg-[#C9933A] flex items-center justify-center">
                                    <Check className="w-4 h-4 text-[#3F1F00]" />
                                </div>
                                <span className="font-sans text-[#FDF6E3]/90 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-4xl font-cormorant italic font-bold text-[#C9933A]">
                            AASHEY
                        </h1>
                        <p className="font-sc text-xs tracking-[0.2em] text-[#6B4423] uppercase mt-1">
                            Pure A2 Cow Ghee
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-[#C9933A]/20">
                            {["login", "register"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`flex-1 py-4 font-sc text-xs tracking-[0.15em] uppercase transition-all ${activeTab === tab
                                        ? "text-[#3F1F00] border-b-2 border-[#C9933A] bg-[#FDF6E3]"
                                        : "text-[#5C3A1E] hover:text-[#3F1F00]"
                                        }`}
                                >
                                    {tab === "login" ? "Sign In" : "Create Account"}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            {activeTab === "login" && <LoginForm />}
                            {activeTab === "register" && <RegisterForm />}
                        </div>
                    </div>

                    <p className="text-center text-sm text-[#5C3A1E] mt-6">
                        <Link
                            href="/"
                            className="text-[#C9933A] hover:text-[#3F1F00] font-medium"
                        >
                            ← Continue Shopping
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

        if (!email || !password) {
            toast.error("Email and password are required");
            return;
        }

        setIsSubmitting(true);

        try {
            await login(email, password);
            toast.success("Welcome back!");

            const returnUrl =
                searchParams.get("returnUrl") || searchParams.get("redirect");

            router.push(returnUrl ? decodeURIComponent(returnUrl) : "/");
        } catch (error) {
            toast.error(
                error?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-8">
                <h1 className="font-cormorant text-3xl font-semibold text-[#3F1F00]">
                    Welcome Back
                </h1>
                <p className="font-sans text-[#C9933A] text-sm italic mt-2">
                    Login to your Aashey account
                </p>
            </div>

            <InputField
                icon={<Mail />}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
            />

            <PasswordField
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3]"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </Button>

            <p className="text-center text-sm">
                New here?{" "}
                <button
                    type="button"
                    onClick={() => router.push("/auth?tab=register")}
                    className="underline font-semibold text-[#3F1F00]"
                >
                    Create account
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
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
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
            <InputField
                icon={<User />}
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
            />

            <InputField
                icon={<Mail />}
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
            />

            <InputField
                icon={<Phone />}
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
            />

            <PasswordField
                name="password"
                value={formData.password}
                onChange={handleChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />

            <InputField
                icon={<Lock />}
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
            />

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3]"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>
        </form>
    );
}

/* ============================= */
/*        REUSABLE FIELDS        */
/* ============================= */

function InputField({
    icon,
    type = "text",
    value,
    onChange,
    placeholder,
    name,
}) {
    return (
        <div className="relative">
            <div className="absolute left-4 top-3.5 text-[#C9933A]/60">
                {icon}
            </div>
            <input
                type={type}
                name={name}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 pl-12 px-4 border border-[#C9933A]/30 rounded-xl bg-[#FDF6E3]/50 font-sans text-sm text-[#3F1F00] placeholder:text-[#7A4E2D] focus:border-[#C9933A] focus:ring-1 focus:ring-[#C9933A]/30 outline-none transition-colors"
            />
        </div>
    );
}

function PasswordField({
    value,
    onChange,
    showPassword,
    setShowPassword,
    name = "password",
}) {
    return (
        <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[#C9933A]/60" />
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Password"
                className="w-full h-12 pl-12 pr-12 px-4 border border-[#C9933A]/30 rounded-xl bg-[#FDF6E3]/50 font-sans text-sm text-[#3F1F00] placeholder:text-[#7A4E2D] focus:border-[#C9933A] focus:ring-1 focus:ring-[#C9933A]/30 outline-none transition-colors"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}

/* ============================= */
/*         PAGE EXPORT           */
/* ============================= */

export default function AuthPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <AuthForm />
        </Suspense>
    );
}