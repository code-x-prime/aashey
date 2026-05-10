import { Music2, PartyPopper, Building2, Church, School, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";

export const metadata = {
    title: "Industries We Serve | Aashey - Pure A2 Cow Ghee",
    description: "Discover how Aashey Pure A2 Bilona Ghee serves various industries, from wellness centers to premium restaurants.",
};

const industries = [
    {
        icon: HeartPulse,
        name: "Wellness & Spa",
        description: "Pure A2 Ghee is a cornerstone of Ayurvedic treatments and wellness therapies.",
        features: ["Massages & Udvartana", "Nutritional detox", "Skin treatments"],
        link: "/products",
    },
    {
        icon: Coffee,
        name: "Premium Restaurants",
        description: "Enhance the flavor of gourmet dishes with traditionally crafted Bilona ghee.",
        features: ["Authentic flavor profile", "High smoke point", "Bulk availability"],
        link: "/products",
    },
    {
        icon: Store,
        name: "Ayurvedic Clinics",
        description: "Medically consistent purity for practitioners and patients.",
        features: ["Sattvic quality", "No preservatives", "Lab tested purity"],
        link: "/products",
    },
    {
        icon: Flame,
        name: "Temples & Rituals",
        description: "Purity for sacred ceremonies and traditional lamps.",
        features: ["Pure cow ghee", "Spiritual authenticity", "High quality"],
        link: "/products",
    },
    {
        icon: Home,
        name: "Home Cooks",
        description: "Bringing health and tradition to every family kitchen.",
        features: ["Daily nutrition", "A2 benefits", "Traditional taste"],
        link: "/products",
    },
];

export default function IndustriesPage() {
    return (
        <div className="bg-page min-h-screen">
            <PageHero
                title="Industries We Serve"
                description="Pure A2 Bilona Ghee solutions tailored for your health and business needs"
                breadcrumbs={[{ label: "Industries" }]}
                variant="default"
                size="md"
            />

            {/* Industries Grid */}
            <section className="bg-section-white section-padding">
                <div className="section-container">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {industries.map((industry, index) => (
                            <Link
                                key={index}
                                href={industry.link}
                                className="group bg-white border-2 border-border rounded-2xl p-8 hover:border-primary hover:shadow-xl transition-all"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                    <industry.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-sans font-bold text-xl text-foreground mb-3">
                                    {industry.name}
                                </h3>
                                <p className="text-[#6B4423] mb-6 leading-relaxed">
                                    {industry.description}
                                </p>
                                <div className="space-y-2 mb-6">
                                    {industry.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-[#6B4423]">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                                    Shop Products
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-muted/30 section-padding">
                <div className="section-container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-sans text-3xl font-bold text-foreground mb-4">
                            Need Help Choosing?
                        </h2>
                        <p className="text-lg text-[#6B4423] mb-8">
                            Our team can recommend the perfect product range for your specific use case, whether for home use or bulk business needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact">
                                <Button size="lg" className="rounded-full px-8">
                                    Get Expert Advice
                                </Button>
                            </Link>
                            <Link href="/products">
                                <Button variant="outline" size="lg" className="rounded-full px-8">
                                    Browse All Products
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

