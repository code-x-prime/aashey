import { Shield, CheckCircle2, FileText, Phone, Leaf, Award, HeartPulse, RefreshCw } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";

export const metadata = {
    title: "Quality Guarantee | Aashey - Pure A2 Bilona Ghee",
    description: "Learn about our commitment to purity, traditional Bilona method, and quality guarantee.",
};

const guaranteeFeatures = [
    {
        icon: Leaf,
        title: "100% Pure A2 Ghee",
        description: "We guarantee that our ghee is made exclusively from the milk of A2 desi cows."
    },
    {
        icon: Award,
        title: "Traditional Bilona Method",
        description: "Hand-churned in small batches using the ancient Vedic Bilona method for maximum nutrition."
    },
    {
        icon: Shield,
        title: "Lab Tested Purity",
        description: "Every batch is tested for purity, fat content, and zero adulteration."
    },
    {
        icon: HeartPulse,
        title: "Zero Preservatives",
        description: "No additives, no flavors, and no preservatives. Just 100% pure ghee."
    }
];

export default function WarrantyPage() {
    return (
        <div className="min-h-screen bg-[#FDF6E3]">
            <PageHero
                title="Quality Guarantee"
                description="Our commitment to purity and tradition in every jar"
                breadcrumbs={[{ label: "Guarantee" }]}
                variant="default"
                size="sm"
            />

            <section className="bg-white py-12 md:py-16">
                <div className="section-container max-w-4xl">
                    {/* Guarantee Features */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {guaranteeFeatures.map((feature, index) => (
                            <div key={index} className="bg-[#FDF6E3] border border-[#C9933A]/12 rounded-lg p-6">
                                <div className="w-11 h-11 bg-[#C9933A]/10 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="h-5 w-5 text-[#C9933A]" />
                                </div>
                                <h3 className="font-sans font-semibold text-base text-[#3F1F00] mb-2">{feature.title}</h3>
                                <p className="font-sans text-[#5C3A1E] text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Quality Policy */}
                    <div className="prose prose-lg max-w-none">
                        <h2 className="font-sans text-2xl font-bold mb-4">Our Purity Promise</h2>
                        <p className="mb-4">
                            At Aashey, we believe that ghee is not just a food product, but a source of life and health. Our quality guarantee covers:
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li>Authentic A2 Cow Milk sourcing from certified farms</li>
                            <li>Traditional Bilona method (Curd -{">"} Churn -{">"} Butter -{">"} Ghee)</li>
                            <li>Slow-cooking in earthen or brass pots for better aroma</li>
                            <li>Hygienic glass-jar packaging to preserve nutrition</li>
                            <li>Zero use of machines for churning butter</li>
                        </ul>

                        <h2 className="font-sans text-2xl font-bold mb-4">Quality Assurance Process</h2>
                        <p className="mb-4">
                            Every jar of Aashey ghee undergoes a rigorous quality check:
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li><strong>Milk Testing:</strong> Tested for A2 beta-casein protein and zero antibiotics.</li>
                            <li><strong>Traditional Churning:</strong> Curd is churned before sunrise as per Vedic traditions.</li>
                            <li><strong>Manual Clarification:</strong> Controlled heating to ensure the perfect granular texture.</li>
                            <li><strong>Aroma & Taste:</strong> Sensory evaluation to ensure the signature nutty aroma.</li>
                            <li><strong>Lab Certification:</strong> Batch-wise testing for fat percentage and nutritional profile.</li>
                        </ul>

                        <h2 className="font-sans text-2xl font-bold mb-4">What If You Are Not Satisfied?</h2>
                        <p className="mb-4">
                            We take immense pride in our craft. However, if you feel the quality is not up to our promise:
                        </p>
                        <ol className="space-y-3 mb-8 list-decimal list-inside">
                            <li><strong>Contact Us:</strong> Email us at aashey@gmail.com within 7 days of delivery.</li>
                            <li><strong>Share Feedback:</strong> Let us know your concern with photos of the product and batch number.</li>
                            <li><strong>Quality Check:</strong> Our master craftsman will review your feedback.</li>
                            <li><strong>Resolution:</strong> We will provide a replacement or a refund if a quality issue is verified.</li>
                        </ol>

                        <h2 className="font-sans text-2xl font-bold mb-4">Storage Tips for Longevity</h2>
                        <p className="mb-4">
                            Pure Bilona ghee has a long shelf life, but proper storage is key:
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li>Store in a cool, dry place away from direct sunlight.</li>
                            <li>Always use a clean, dry spoon to avoid moisture contamination.</li>
                            <li>Do not refrigerate, as it may affect the texture and aroma.</li>
                            <li>Keep the lid tightly closed when not in use.</li>
                        </ul>

                        <h2 className="font-sans text-2xl font-bold mb-4">Contact Quality Support</h2>
                        <p className="mb-4">
                            For any queries regarding our process or product quality:
                        </p>
                        <ul className="space-y-2">
                            <li>Email: <strong>aashey@gmail.com</strong></li>
                            <li>Available: Monday - Saturday, 9 AM - 7 PM</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
