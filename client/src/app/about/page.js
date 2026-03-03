import { CheckCircle, ArrowRight, Leaf, Beaker, Milk, FlameKindling } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "About Us | Aashey – Born from Purity, Built on Trust",
    description: "Discover the story of Aashey — a mother's care that became a movement for pure, traditional A2 Bilona Ghee. Founded in 2020 by Smt. Asha Deshmukh.",
};

const processSteps = [
    {
        step: "01",
        title: "Boil & Culture",
        description: "Fresh A2 milk is carefully boiled and naturally converted into curd — no shortcuts, no artificial cultures.",
    },
    {
        step: "02",
        title: "Hand-Churn",
        description: "The curd is hand-churned using traditional wooden churners, the same way it was done for centuries.",
    },
    {
        step: "03",
        title: "Separate Butter",
        description: "Pure white butter is gently separated from the churned curd and collected with care.",
    },
    {
        step: "04",
        title: "Slow Simmer",
        description: "The butter is slowly simmered on low flame into golden, aromatic ghee — preserving all nutrients.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#FDF6E3]">

            {/* ── HERO ── */}
            <section className="relative bg-[#3F1F00] py-10 md:py-16 overflow-hidden">
                {/* subtle grain texture overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9933A 1px, transparent 0)", backgroundSize: "32px 32px" }}
                />
                <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C9933A]/15 border border-[#C9933A]/30 rounded-full mb-6">
                            <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase text-[#C9933A]">Our Story</span>
                        </span>
                        <h1 className="font-cormorant text-5xl md:text-6xl lg:text-7xl font-bold text-[#FDF6E3] leading-tight mb-4">
                            Born from Purity,<br />
                            <span className="text-[#C9933A] italic">Built on Trust.</span>
                        </h1>
                        <p className="font-sans text-[#FDF6E3]/65 text-lg md:text-xl leading-relaxed max-w-2xl">
                            What started as a mother&apos;s care for her family has grown into a commitment
                            to bring pure, traditional A2 Bilona Ghee to every household in India.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-8">
                            {["A2 Bilona Ghee", "Since 2020", "No Preservatives", "Small-Batch Production"].map((tag) => (
                                <span key={tag} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FDF6E3]/8 border border-[#FDF6E3]/15 rounded-full font-sans text-sm text-[#FDF6E3]/70">
                                    <CheckCircle className="w-3.5 h-3.5 text-[#C9933A]" /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="bg-[#092D15] py-10 md:py-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: "2020", label: "Year Founded" },
                            { value: "50K+", label: "Happy Families" },
                            { value: "100%", label: "Pure A2 Milk" },
                            { value: "0", label: "Preservatives Added" },
                        ].map((stat, i) => (
                            <div key={i} className="py-2">
                                <p className="font-playfair text-3xl md:text-4xl font-bold text-[#C9933A] leading-none mb-2">{stat.value}</p>
                                <p className="font-sans text-sm text-[#FDF6E3]/65">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUR STORY ── */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-start">

                        {/* Left — heading + pull quote */}
                        <div className="lg:sticky lg:top-28">
                            <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A] uppercase block mb-4">About Us</span>
                            <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-[#3F1F00] leading-tight mb-6">
                                A Tradition That<br />Began at Home.
                            </h2>
                            <div className="w-14 h-0.5 bg-[#C9933A] mb-8" />
                            <blockquote className="border-l-4 border-[#C9933A] pl-6 py-2">
                                <p className="font-playfair italic text-xl text-[#3F1F00] leading-relaxed">
                                    &ldquo;We will never produce in large volumes if it affects quality.&rdquo;
                                </p>
                                <footer className="font-sans text-sm text-[#8B6040] mt-3 font-medium">
                                    — Smt. Asha Deshmukh, Founder
                                </footer>
                            </blockquote>

                            <div className="mt-10 bg-[#3F1F00] rounded-2xl p-6">
                                <p className="font-sans text-xs font-semibold tracking-[0.15em] text-[#C9933A] uppercase mb-3">The Founder</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-[#C9933A]/20 border-2 border-[#C9933A]/40 flex items-center justify-center flex-shrink-0">
                                        <span className="font-playfair font-bold text-2xl text-[#C9933A]">A</span>
                                    </div>
                                    <div>
                                        <p className="font-playfair font-bold text-[#FDF6E3] text-lg leading-tight">Smt. Asha Deshmukh</p>
                                        <p className="font-sans text-sm text-[#FDF6E3]/60 mt-0.5">Age 64 · Jalgaon, Maharashtra</p>
                                        <p className="font-sans text-xs text-[#C9933A] mt-1">Started in 2020</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right — story paragraphs */}
                        <div className="space-y-6 font-sans text-base text-[#4A2C0A] leading-[1.9]">
                            <p>
                                Every meaningful journey begins at home. AASHEY began not as a business, but as a
                                mother&apos;s care for her family. In 2020, when families became more conscious about
                                health and authentic nutrition, <strong className="text-[#3F1F00] font-semibold">Smt. Asha Deshmukh</strong>, at the age of 64, began preparing
                                traditional A2 Bilona Ghee for her own household.
                            </p>
                            <p>
                                Her intention was simple — to serve pure, nourishing, and trustworthy ghee made the
                                way it was prepared in earlier generations. Using traditional methods and preparing
                                only in small quantities, she ensured that every batch carried the same aroma,
                                richness, and purity she had known throughout her life.
                            </p>
                            <p>
                                Soon, neighbours and close circles began noticing the difference — the authentic
                                fragrance, natural granular texture, richness in taste, and unmistakable feeling of
                                purity. There were no advertisements. No marketing campaigns.{" "}
                                <strong className="text-[#3F1F00] font-semibold">Only word-of-mouth appreciation and growing trust.</strong>
                            </p>
                            <p>
                                As demand increased, the family continued with the same principles —
                                small-batch production, strict hygiene standards, and uncompromised purity.
                            </p>
                            <p className="text-[#3F1F00] font-semibold text-lg font-playfair italic">
                                Even today, every batch is prepared with patience and discipline. Hygiene is
                                maintained at every stage. The traditional Bilona method is respected.
                                The purity is protected.
                            </p>
                            <p className="text-[#C9933A] font-playfair font-semibold text-lg italic">
                                AASHEY – From a Mother&apos;s Kitchen to Your Family&apos;s Table.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SOURCING ── */}
            <section className="py-16 md:py-20 bg-[#092D15]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A] uppercase block mb-4">Our Sourcing</span>
                            <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-[#FDF6E3] leading-tight mb-4">
                                Purity Begins<br />at the Source.
                            </h2>
                            <div className="w-14 h-0.5 bg-[#C9933A] mb-6" />
                            <p className="font-sans text-[#FDF6E3]/65 text-base leading-relaxed mb-5">
                                At AASHEY, we believe purity does not begin in the kitchen — it begins at the farm.
                                We source fresh A2 milk directly from trusted local farmers who raise indigenous
                                Indian cows with care and responsibility.
                            </p>
                            <p className="font-sans text-[#FDF6E3]/65 text-base leading-relaxed">
                                These native breeds are nurtured naturally, following traditional dairy practices
                                that prioritize animal well-being. By maintaining direct relationships with farmers,
                                we ensure transparency and consistency from the very beginning.
                            </p>
                            <p className="font-playfair italic text-[#C9933A] text-lg mt-6">
                                &ldquo;True purity cannot be added later — it must start at the source.&rdquo;
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Leaf, title: "Indigenous Breeds", desc: "Gir, Sahiwal & Tharparkar cows — pure A2 genetics, never mixed." },
                                { icon: Milk, title: "Direct Farmer Tie-ups", desc: "No middlemen. We source directly for full transparency." },
                                { icon: CheckCircle, title: "Natural Rearing", desc: "Free-grazing, natural diet, zero hormones or antibiotics." },
                                { icon: Beaker, title: "Milk Quality Checks", desc: "Every delivery tested before entering our process." },
                            ].map((item, i) => (
                                <div key={i} className="bg-[#FDF6E3]/[0.06] border border-[#C9933A]/15 rounded-xl p-5 hover:border-[#C9933A]/35 transition-colors">
                                    <item.icon className="w-5 h-5 text-[#C9933A] mb-3" />
                                    <p className="font-playfair font-semibold text-[#FDF6E3] text-sm mb-1">{item.title}</p>
                                    <p className="font-sans text-xs text-[#FDF6E3]/50 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PROCESS ── */}
            <section className="py-16 md:py-24 bg-[#FDF6E3]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="text-center mb-14">
                        <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A] uppercase block mb-4">Our Process</span>
                        <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-[#3F1F00] leading-tight">
                            The Traditional Bilona Method
                        </h2>
                        <div className="w-14 h-0.5 bg-[#C9933A] mx-auto mt-5 mb-5" />
                        <p className="font-sans text-[#5C3A1E] text-base max-w-2xl mx-auto leading-relaxed">
                            We follow the ancient Bilona method — a slow and time-honoured process that preserves
                            the true essence of ghee. We never use cream-based shortcuts. We respect tradition —
                            because tradition preserves quality.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="relative">
                        {/* connecting line */}
                        <div className="hidden md:block absolute top-10 left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-0.5 bg-gradient-to-r from-[#C9933A]/20 via-[#C9933A] to-[#C9933A]/20" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                            {processSteps.map((step, i) => (
                                <div key={i} className="flex flex-col items-center text-center group">
                                    {/* Step circle */}
                                    <div className="w-20 h-20 rounded-full bg-[#3F1F00] border-4 border-[#C9933A]/30 group-hover:border-[#C9933A] flex flex-col items-center justify-center mb-5 transition-all duration-300 shadow-[0_4px_24px_rgba(63,31,0,0.2)] relative z-10">
                                        <span className="font-sans text-[10px] font-semibold tracking-widest text-[#C9933A]/60 leading-none">STEP</span>
                                        <span className="font-playfair font-bold text-xl text-[#C9933A] leading-tight">{step.step}</span>
                                    </div>
                                    <h3 className="font-playfair font-bold text-[#3F1F00] text-lg mb-2">{step.title}</h3>
                                    <p className="font-sans text-sm text-[#5C3A1E] leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Process note */}
                    <div className="mt-14 bg-[#3F1F00] rounded-2xl p-7 md:p-10 text-center">
                        <FlameKindling className="w-8 h-8 text-[#C9933A] mx-auto mb-4" />
                        <p className="font-playfair italic text-[#FDF6E3] text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
                            &ldquo;This patient and disciplined process ensures natural aroma, authentic granular texture,
                            better digestibility, and preserved nutrients.&rdquo;
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-14 md:py-16 bg-[#092D15]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 text-center">
                    <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A] uppercase block mb-4">Experience the Difference</span>
                    <h2 className="font-cormorant text-3xl md:text-4xl font-bold text-[#FDF6E3] mb-3 leading-tight">
                        From Our Family&apos;s Kitchen<br />to Your Table.
                    </h2>
                    <p className="font-sans text-[#FDF6E3]/60 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
                        Join 50,000+ families who have made the switch to pure, authentic A2 Bilona Ghee.
                        Free delivery on orders above ₹999.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/products" className="btn-gold gap-2 inline-flex items-center justify-center">
                            Shop Now <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/why-us" className="btn-outline-gold gap-2 inline-flex items-center justify-center">
                            Why Choose Us <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
