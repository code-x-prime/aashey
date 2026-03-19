"use client";

import { useState } from "react";
import { MapPin, MessageCircle, Mail, Clock, Send, Loader2, MessageSquare, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { toast } from "sonner";

export default function ContactPage() {
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "Product Inquiry",
        message: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const response = await fetchApi("/content/contact", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            toast.success(response.data?.message || "Message sent successfully!");
            setFormData({ name: "", email: "", phone: "", subject: "Product Inquiry", message: "" });
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF6E3]">
            {/* Hero */}
            <section className="py-20 md:py-24 bg-gradient-section">
                <div className="section-container text-center">
                    <span className="section-badge mb-5">
                        <MessageSquare className="w-5 h-5" />
                        Get in Touch
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-cormorant font-bold text-[#3F1F00] mb-5 tracking-tight">
                        Contact <span className="text-[#C9933A]">Us</span>
                    </h1>
                    <p className="text-[#1A0A00] text-lg md:text-xl max-w-2xl mx-auto">
                        Have questions about our products or orders? We are here to help. Reach out to us anytime.
                    </p>
                </div>
            </section>

            {/* Quick contact */}
            <section className="section-container -mt-8 pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
                    <a href="mailto:info@aashey.com" className="card-premium p-6 text-center hover:border-[#C9933A]/40 group transition-all">
                        <div className="w-14 h-14 bg-[#C9933A]/15 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C9933A] transition-colors">
                            <Mail className="h-7 w-7 text-[#C9933A] group-hover:text-[#3F1F00]" />
                        </div>
                        <h3 className="font-bold text-[#3F1F00] text-lg mb-1">Email</h3>
                        <p className="text-[#C9933A] font-semibold text-sm break-all">info@aashey.com</p>
                    </a>
                    <a href="https://wa.me/918999046484" target="_blank" rel="noopener noreferrer" className="card-premium p-6 text-center hover:border-[#C9933A]/40 group transition-all">
                        <div className="w-14 h-14 bg-[#25D366]/15 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-[#25D366] transition-colors">
                            <MessageCircle className="h-7 w-7 text-[#25D366] group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-[#3F1F00] text-lg mb-1">WhatsApp</h3>
                        <p className="text-[#25D366] font-semibold text-sm">+91 89990 46484</p>
                    </a>
                    <div className="card-premium p-6 text-center border-[#C9933A]/20">
                        <div className="w-14 h-14 bg-[#3F1F00]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <MapPin className="h-7 w-7 text-[#3F1F00]" />
                        </div>
                        <h3 className="font-bold text-[#3F1F00] text-lg mb-1">Address</h3>
                        <p className="text-[#3F1F00] text-sm leading-relaxed">
                            Village — Takali, Shiv Shakti Nagar, Chalisgaon, Dist — Jalgaon, Maharashtra — 424102
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="section-padding bg-gradient-section">
                <div className="section-container">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Left */}
                        <div className="lg:col-span-2">
                            <span className="section-badge mb-5">Send a Message</span>
                            <h2 className="section-title mb-5">Have a Question?</h2>
                            <p className="text-[#1A0A00] text-lg mb-10 leading-relaxed">
                                Fill out the form and our team will get back to you within 24 hours.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-[#C9933A]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Headphones className="h-6 w-6 text-[#C9933A]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#3F1F00] text-lg">Expert Support</h4>
                                        <p className="text-[#5C3A1E] text-base">Get help from our team</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-[#C9933A]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-6 w-6 text-[#C9933A]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#3F1F00] text-lg">Business Hours</h4>
                                        <p className="text-[#5C3A1E] text-base">Mon-Sat: 9 AM - 7 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-[#FDF6E3] rounded-lg p-8 md:p-10 border border-[#C9933A]/20 shadow-md">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-base font-semibold text-[#3F1F00] mb-2">Full Name *</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Your Name" className="input-premium" />
                                        </div>
                                        <div>
                                            <label className="block text-base font-semibold text-[#3F1F00] mb-2">Phone *</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+91 9876543210" className="input-premium" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-base font-semibold text-[#3F1F00] mb-2">Email *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="you@example.com" className="input-premium" />
                                    </div>

                                    <div>
                                        <label className="block text-base font-semibold text-[#3F1F00] mb-2">Subject</label>
                                        <select name="subject" value={formData.subject} onChange={handleInputChange} className="input-premium">
                                            <option>Product Inquiry</option>
                                            <option>Bulk Order</option>
                                            <option>Order Support</option>
                                            <option>Return/Refund</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-base font-semibold text-[#3F1F00] mb-2">Message *</label>
                                        <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={5} placeholder="Your message..." className="input-premium resize-none" />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full bg-[#C9933A] hover:bg-[#B8842F] text-[#3F1F00] font-bold h-14 rounded-lg gap-3 shadow-lg text-lg" disabled={formLoading}>
                                        {formLoading ? (
                                            <><Loader2 className="h-6 w-6 animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send className="h-6 w-6" /> Send Message</>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-14 md:py-16 bg-[#3F1F00]">
                <div className="section-container">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#FDF6E3] mb-2">Ready to explore our products?</h2>
                            <p className="text-[#FDF6E3]/75 text-lg">Discover our collection of pure A2 Bilona ghee</p>
                        </div>
                        <Link href="/products">
                            <Button size="lg" className="bg-[#C9933A] hover:bg-[#B8842F] text-[#3F1F00] font-bold h-14 px-10 rounded-lg gap-3 shadow-xl text-lg">
                                Browse Products <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
