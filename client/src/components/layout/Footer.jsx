"use client";

import Link from "next/link";
import { MapPin, MessageCircle, Mail, Instagram, Facebook, Youtube, CheckCircle, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/aashey/", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/aashey/", icon: Facebook },
  { name: "YouTube", href: "https://youtube.com/@aashey", icon: Youtube },
];

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "About Us", href: "/about" },
  { name: "Why Us", href: "/why-us" },
  { name: "FAQs", href: "/faqs" },
];

const policyLinks = [
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Return Policy", href: "/return-policy" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Contact Us", href: "/contact" },
];

const trustPoints = [
  "100% Pure A2 Milk",
  "Bilona Hand-Churned",
  "Lab Tested Every Batch",
  "FSSAI Certified",
  "Zero Preservatives",
  "Free Delivery ₹999+",
];

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#0A1F0F]">

      {/* ── DECORATIVE TOP BORDER ── */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, #C9933A 30%, #F0C96B 50%, #C9933A 70%, transparent 100%)" }} />

      {/* ── MAIN FOOTER ── */}
      <div className="py-16 md:py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 md:gap-10">

            {/* ── Col 1: Brand (wider) ── */}
            <div className="lg:col-span-4">
              {/* Logo */}
              <Link href="/" className="mb-5 flex w-fit">
                <Image
                  src="/logo.png"
                  alt="AASHEY"
                  width={140}
                  height={42}
                  className="h-9 md:h-10 w-auto object-contain"
                />
              </Link>

              {/* Tagline */}
              <p className="font-playfair italic text-[#FDF6E3]/70 text-lg leading-relaxed mb-2">
                &ldquo;Made with love, crafted with tradition.&rdquo;
              </p>
              <p className="font-sans text-sm text-[#FDF6E3]/55 leading-relaxed max-w-[260px]">
                Free-grazing Gir cows. Ancient Bilona method. Zero shortcuts.
                Pure ghee, exactly as nature intended.
              </p>

              {/* Social */}
              <div className="flex gap-3 mt-7">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#FDF6E3]/60 hover:bg-[#C9933A] hover:text-white hover:border-[#C9933A] transition-all duration-300 hover:scale-110"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              {/* Mini trust line */}
              <div className="mt-8 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["R", "P", "A", "S", "K"].map((initial, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-[#C9933A]/20 border-2 border-[#0A1F0F] flex items-center justify-center">
                      <span className="font-playfair font-bold text-[10px] text-[#C9933A]">{initial}</span>
                    </div>
                  ))}
                </div>
                <p className="font-sans text-xs text-[#FDF6E3]/50">
                  Trusted by <span className="text-[#C9933A] font-semibold">50,000+</span> families
                </p>
              </div>
            </div>

            {/* ── Col 2: Explore ── */}
            <div className="lg:col-span-2">
              <h4 className="font-playfair font-bold text-[#FDF6E3] text-[15px] mb-5 pb-2.5 border-b border-[#C9933A]/25 uppercase tracking-wider">
                Explore
              </h4>
              <ul className="space-y-0.5">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-2 font-sans text-[13px] text-[#FDF6E3]/65 hover:text-[#C9933A] transition-colors duration-200"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 3: Policies ── */}
            <div className="lg:col-span-3">
              <h4 className="font-playfair font-bold text-[#FDF6E3] text-[15px] mb-5 pb-2.5 border-b border-[#C9933A]/25 uppercase tracking-wider">
                Policies & Help
              </h4>
              <ul className="space-y-0.5">
                {policyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-2 font-sans text-[13px] text-[#FDF6E3]/65 hover:text-[#C9933A] transition-colors duration-200"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 4: Contact ── */}
            <div className="lg:col-span-3">
              <h4 className="font-playfair font-bold text-[#FDF6E3] text-[15px] mb-5 pb-2.5 border-b border-[#C9933A]/25 uppercase tracking-wider">
                Get In Touch
              </h4>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9933A]/10 border border-[#C9933A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9933A]" />
                  </div>
                  <div>
                    <p className="font-sans text-xs font-semibold text-[#FDF6E3]/40 uppercase tracking-wider mb-1">Address</p>
                    <p className="font-sans text-sm text-[#FDF6E3]/65 leading-relaxed">
                      Village — Takali, Shiv Shakti Nagar,<br />
                      Chalisgaon, Dist — Jalgaon,<br />
                      Maharashtra — 424102
                    </p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9933A]/10 border border-[#C9933A]/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-3.5 h-3.5 text-[#C9933A]" />
                  </div>
                  <div>
                    <p className="font-sans text-xs font-semibold text-[#FDF6E3]/40 uppercase tracking-wider mb-1">WhatsApp</p>
                    <a
                      href="https://wa.me/918999046484"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-sm text-[#FDF6E3]/65 hover:text-[#C9933A] transition-colors"
                    >
                      +91 89990 46484
                    </a>
                  </div>
                </li>

                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9933A]/10 border border-[#C9933A]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-[#C9933A]" />
                  </div>
                  <div>
                    <p className="font-sans text-xs font-semibold text-[#FDF6E3]/40 uppercase tracking-wider mb-1">Email</p>
                    <a
                      href="mailto:info@aashey.com"
                      className="font-sans text-sm text-[#FDF6E3]/65 hover:text-[#C9933A] transition-colors"
                    >
                      info@aashey.com
                    </a>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── TRUST BADGES BAR ── */}
      <div className="border-t border-[#C9933A]/10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#C9933A] flex-shrink-0" />
                <span className="font-sans text-xs font-medium text-[#FDF6E3]/65">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM COPYRIGHT BAR ── */}
      <div className="border-t border-white/[0.04] py-5 px-4 md:px-8 lg:px-16 bg-[#061409]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">

          <p className="font-sans text-xs text-[#FDF6E3]/35">
            © 2026 <span className="text-[#FDF6E3]/55 font-medium">Aashey Consumer Products Pvt. Ltd.</span> All rights reserved.
          </p>

          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#C9933A]/8 border border-[#C9933A]/15 rounded-full">
            <span className="font-sans text-[11px] text-[#C9933A]/70 font-medium">FSSAI</span>
            <span className="w-px h-3 bg-[#C9933A]/20" />
            <span className="font-mono text-[11px] text-[#FDF6E3]/40 tracking-wide">21526073000396</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <p className="font-sans text-xs text-[#FDF6E3]/35">
              Crafted with ❤️ in India 🇮🇳
            </p>
            <span className="hidden sm:inline w-px h-3 bg-[#FDF6E3]/15" />
            <a
              href="https://groxmedia.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-[#FDF6E3]/45 hover:text-[#C9933A] transition-colors"
            >
              Develop & Design by <span className="font-semibold text-[#FDF6E3]/60">Grox Media</span>
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
