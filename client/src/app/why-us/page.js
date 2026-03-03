import { Award, Droplets, Truck, Shield, Leaf, Heart, Beaker, CheckCircle, ArrowRight, Package, FlaskConical } from "lucide-react";
import Link from "next/link";
import { TestimonialsCarousel } from "@/components/sections/TestimonialsCarousel";

export const metadata = {
    title: "Why Choose Aashey | Pure A2 Cow Ghee – More Than Ghee, A Commitment",
    description: "Choosing ghee is about trust. Discover why thousands of families choose Aashey — small-batch, Bilona-churned, A2 milk, zero preservatives.",
};

const commitments = [
    {
        icon: Package,
        title: "Small-Batch Production",
        tagline: "Limited qty. Maximum quality.",
        description: "We deliberately limit production quantities so every batch receives the same attention, care, and quality control as the first batch ever made.",
    },
    {
        icon: Droplets,
        title: "Traditional Bilona Method",
        tagline: "Curd-churning, not cream shortcuts.",
        description: "We hand-churn curd the ancient way — not the industrial cream method. This preserves the natural aroma, granular texture, and true nutrition of A2 ghee.",
    },
    {
        icon: Leaf,
        title: "Indigenous A2 Cow Milk",
        tagline: "Gir, Sahiwal, Tharparkar — pure.",
        description: "We source only from trusted local farmers raising indigenous Indian cows. No mixing with A1 or buffalo milk. Ever. Direct farm tie-ups ensure traceability.",
    },
    {
        icon: Shield,
        title: "Strict Hygiene Standards",
        tagline: "Clean handling at every stage.",
        description: "From farm to jar, hygiene is non-negotiable. Every utensil, every surface, every hand that touches our ghee follows strict cleanliness protocols.",
    },
    {
        icon: FlaskConical,
        title: "No Compromise Policy",
        tagline: "Zero preservatives. Zero additives.",
        description: "No preservatives, no artificial flavoring, no additives of any kind. What goes into our ghee is A2 milk curd — and nothing else.",
    },
    {
        icon: Heart,
        title: "A Mother's Foundation",
        tagline: "Built on the intention to serve the best.",
        description: "AASHEY was founded in 2020 by Smt. Asha Deshmukh at age 64 — not to build a business, but to serve her family. That intent shapes every jar we fill.",
    },
];

const reasons = [
    {
        icon: Beaker,
        title: "Lab Tested Every Batch",
        description: "Every batch undergoes rigorous lab testing for purity, fat content, and adulteration — and the report is included with your order.",
    },
    {
        icon: Award,
        title: "FSSAI Certified",
        description: "FSSAI Lic. No. 21526073000396. Fully compliant with Indian food safety regulations. No grey areas.",
    },
    {
        icon: Truck,
        title: "Free Delivery ₹999+",
        description: "Free delivery across India on orders above ₹999. Secure, insulated packaging to preserve freshness during transit.",
    },
    {
        icon: Droplets,
        title: "Authentic Granular Texture",
        description: "Real Bilona ghee solidifies with a natural grainy texture at room temperature. That granularity is the proof of purity — you can see it.",
    },
];

const stats = [
    { value: "2020", label: "Year Founded" },
    { value: "50K+", label: "Happy Families" },
    { value: "100%", label: "Pure A2 Milk" },
    { value: "99%", label: "Satisfaction Rate" },
];

export default function WhyUsPage() {
    return (
        <div className="min-h-screen bg-[#FDF6E3]">

            {/* ── HERO ── */}
            <section className="relative bg-[#3F1F00] py-10 md:py-16 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9933A 1px, transparent 0)", backgroundSize: "32px 32px" }}
                />
                <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C9933A]/15 border border-[#C9933A]/30 rounded-full mb-6">
                        <Award className="w-4 h-4 text-[#C9933A]" />
                        <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-[#C9933A]">Why Aashey</span>
                    </span>
                    <h1 className="font-cormorant text-5xl md:text-6xl lg:text-7xl font-bold text-[#FDF6E3] leading-tight mb-4">
                        More Than Ghee.<br />
                        <span className="text-[#C9933A] italic">A Commitment to Purity.</span>
                    </h1>
                    <p className="font-sans text-[#FDF6E3]/65 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Choosing ghee is not just about taste — it is about trust. Here is why thousands
                        of families choose Aashey, every single day.
                    </p>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="bg-[#092D15] py-10 md:py-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {stats.map((stat, i) => (
                            <div key={i} className="py-2">
                                <p className="font-playfair text-3xl md:text-4xl font-bold text-[#C9933A] leading-none mb-2">{stat.value}</p>
                                <p className="font-sans text-sm text-[#FDF6E3]/65">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 6 CORE COMMITMENTS ── */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="text-center mb-14">
                        <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A] uppercase block mb-4">Our Promise</span>
                        <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-[#3F1F00] leading-tight">
                            What Sets Aashey Apart
                        </h2>
                        <div className="w-14 h-0.5 bg-[#C9933A] mx-auto mt-5 mb-5" />
                        <p className="font-sans text-[#5C3A1E] text-base max-w-2xl mx-auto leading-relaxed">
                            When you choose Aashey, you choose authenticity over convenience,
                            purity over volume, and trust over marketing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {commitments.map((item, i) => (
                            <div
                                key={i}
                                className="group bg-white border border-[#C9933A]/15 rounded-2xl p-7 hover:border-[#C9933A]/50 hover:shadow-[0_8px_40px_rgba(201,147,58,0.12)] transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 bg-[#3F1F00] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9933A] transition-colors duration-300">
                                        <item.icon className="h-5 w-5 text-[#C9933A] group-hover:text-[#3F1F00] transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-playfair font-bold text-[#3F1F00] text-lg leading-snug">{item.title}</h3>
                                        <p className="font-sans text-xs font-semibold text-[#C9933A] mt-0.5">{item.tagline}</p>
                                    </div>
                                </div>
                                <p className="font-sans text-sm text-[#5C3A1E] leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Summary line */}
                    <div className="mt-12 bg-[#3F1F00] rounded-2xl p-7 md:p-10">
                        <div className="flex flex-wrap gap-4 justify-center">
                            {[
                                "Authenticity over Convenience",
                                "Purity over Volume",
                                "Trust over Marketing",
                            ].map((phrase, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#C9933A] flex-shrink-0" />
                                    <span className="font-playfair italic text-[#FDF6E3] text-lg">{phrase}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4 ADDITIONAL REASONS ── */}
            <section className="py-14 md:py-18 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="text-center mb-12">
                        <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A] uppercase block mb-4">Also Worth Knowing</span>
                        <h2 className="font-cormorant text-3xl md:text-4xl font-bold text-[#3F1F00]">
                            Built for Your Peace of Mind
                        </h2>
                        <div className="w-14 h-0.5 bg-[#C9933A] mx-auto mt-5" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {reasons.map((r, i) => (
                            <div key={i} className="bg-[#FDF6E3] border border-[#C9933A]/15 rounded-xl p-6 hover:border-[#C9933A]/40 hover:shadow-md transition-all">
                                <div className="w-10 h-10 bg-[#C9933A]/10 rounded-lg flex items-center justify-center mb-4">
                                    <r.icon className="h-5 w-5 text-[#C9933A]" />
                                </div>
                                <h3 className="font-playfair font-semibold text-[#3F1F00] text-base mb-2">{r.title}</h3>
                                <p className="font-sans text-sm text-[#5C3A1E] leading-relaxed">{r.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <TestimonialsCarousel bg="cream" showStats={false} />

            {/* ── CTA ── */}
            <section className="py-14 md:py-16 bg-[#3F1F00]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 text-center">
                    <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A] uppercase block mb-4">Make the Switch</span>
                    <h2 className="font-cormorant text-3xl md:text-4xl font-bold text-[#FDF6E3] mb-3 leading-tight">
                        Ready to Experience Pure A2 Ghee?
                    </h2>
                    <p className="font-sans text-[#FDF6E3]/60 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
                        Join thousands of families who have made the switch.
                        Free delivery on orders above ₹999.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/products" className="btn-gold gap-2 inline-flex items-center justify-center">
                            Shop Now <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/about" className="btn-outline-gold gap-2 inline-flex items-center justify-center">
                            Read Our Story <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
