"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function FAQsPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [categories, setCategories] = useState(["all"]);

    useEffect(() => {
        async function fetchFAQs() {
            setLoading(true);
            try {
                const response = await fetchApi("/faqs");

                // Handle various possible response formats
                let faqsData = [];
                if (response?.data?.faqs && Array.isArray(response.data.faqs)) {
                    faqsData = response.data.faqs;
                } else if (Array.isArray(response?.data)) {
                    faqsData = response.data;
                } else if (response?.data?.data && Array.isArray(response.data.data)) {
                    faqsData = response.data.data;
                }

                setFaqs(faqsData);
                setFilteredFaqs(faqsData);

                // Fetch categories
                const categoriesResponse = await fetchApi("/faqs/categories");

                let categoriesData = [];
                if (categoriesResponse?.data?.categories) {
                    categoriesData = categoriesResponse.data.categories;
                } else if (Array.isArray(categoriesResponse?.data)) {
                    categoriesData = categoriesResponse.data;
                } else if (
                    categoriesResponse?.data?.data &&
                    Array.isArray(categoriesResponse.data.data)
                ) {
                    categoriesData = categoriesResponse.data.data;
                }

                if (categoriesData.length) {
                    setCategories(["all", ...categoriesData.map((cat) => cat.name)]);
                }
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchFAQs();
    }, []);

    // Filter FAQs based on search query and category
    useEffect(() => {
        if (!faqs.length) return;

        let filtered = faqs;

        if (activeCategory !== "all") {
            filtered = filtered.filter((faq) => faq.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (faq) =>
                    faq.question.toLowerCase().includes(query) ||
                    faq.answer.toLowerCase().includes(query)
            );
        }

        filtered = [...filtered].sort((a, b) => a.order - b.order);

        setFilteredFaqs(filtered);
    }, [searchQuery, activeCategory, faqs]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDF6E3]">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        <Skeleton className="h-10 w-1/2 mx-auto mb-6 bg-[#C9933A]/10" />
                        <Skeleton className="h-5 w-full mb-2 bg-[#C9933A]/10" />
                        <Skeleton className="h-5 w-3/4 mb-10 mx-auto bg-[#C9933A]/10" />
                        <Skeleton className="h-12 w-full mb-8 bg-[#C9933A]/10" />
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border border-[#C9933A]/15 rounded-lg p-4">
                                    <Skeleton className="h-6 w-full mb-2 bg-[#C9933A]/10" />
                                    <Skeleton className="h-16 w-full bg-[#C9933A]/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDF6E3]">
            {/* Hero */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-[#3F1F00] to-[#3F1F00]/90">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C9933A]/20 border border-[#C9933A]/30 rounded-full mb-6">
                        <HelpCircle className="w-4 h-4 text-[#C9933A]" />
                        <span className="font-sc text-xs tracking-[0.12em] uppercase text-[#C9933A]">Help Center</span>
                    </div>
                    <h1 className="font-cormorant text-3xl md:text-5xl font-semibold text-[#FDF6E3] mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="font-sans text-[#FDF6E3]/70 text-base md:text-lg max-w-2xl mx-auto">
                        Find answers to common questions about our products, ordering, shipping, and more.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-6">
                <div className="max-w-4xl mx-auto">
                    {/* Search bar */}
                    <div className="relative max-w-lg mx-auto mb-8">
                        <Input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 h-12 rounded-lg border border-[#C9933A]/25 bg-white focus:border-[#C9933A] focus:ring-[#C9933A]/20 font-sans text-[#3F1F00] shadow-sm"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#C9933A]/60" />
                    </div>

                    {/* Category filters */}
                    {categories.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-10">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-4 py-2 rounded-lg font-sc text-xs tracking-[0.08em] uppercase font-medium transition-colors ${activeCategory === category
                                        ? "bg-[#3F1F00] text-[#FDF6E3]"
                                        : "bg-white border border-[#C9933A]/20 text-[#3F1F00] hover:border-[#C9933A]/40"
                                        }`}
                                >
                                    {category === "all" ? "All Questions" : category}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* FAQ Accordion */}
                    <div className="py-8">
                        {filteredFaqs.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full space-y-3">
                                {filteredFaqs.map((faq) => (
                                    <AccordionItem
                                        key={faq.id}
                                        value={faq.id.toString()}
                                        className="border border-[#C9933A]/15 rounded-lg px-4 bg-white hover:border-[#C9933A]/30 transition-colors"
                                    >
                                        <AccordionTrigger className="font-playfair text-base font-medium py-4 px-1 hover:no-underline text-[#3F1F00]">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="px-1 pb-4 pt-1 font-sans text-[#3F1F00] text-sm leading-relaxed">
                                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-10">
                                <HelpCircle className="w-12 h-12 text-[#C9933A]/40 mx-auto mb-4" />
                                <p className="font-cormorant text-lg font-semibold text-[#3F1F00] mb-2">
                                    No FAQs found for &quot;{searchQuery}&quot;
                                </p>
                                <span className="font-sans text-[#5C3A1E] text-sm">
                                    Try a different search term or{" "}
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setActiveCategory("all");
                                        }}
                                        className="text-[#C9933A] hover:underline font-medium"
                                    >
                                        view all FAQs
                                    </button>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Contact section */}
                    <div className="mt-8 mb-16 bg-[#3F1F00] p-8 md:p-10 rounded-lg text-center">
                        <h2 className="font-cormorant text-2xl font-semibold text-[#FDF6E3] mb-3">Still have questions?</h2>
                        <p className="font-sans text-[#FDF6E3]/70 text-sm mb-6 max-w-md mx-auto">
                            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C9933A] text-[#3F1F00] rounded-lg font-sans font-semibold hover:bg-[#F0C96B] transition-colors text-sm"
                            >
                                Contact Us <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href="mailto:support@aashey.com"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#C9933A]/40 text-[#FDF6E3] rounded-lg font-sans font-semibold hover:bg-[#C9933A]/10 transition-colors text-sm"
                            >
                                <Mail className="w-4 h-4" /> Email Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
