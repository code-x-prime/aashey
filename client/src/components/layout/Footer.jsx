"use client";

import Link from "next/link";
import Image from "next/image";

import {
  RiMapPin2Line,
  RiWhatsappLine,
  RiMailLine,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiYoutubeLine,
  RiArrowRightUpLine,
  RiCheckboxCircleLine,
  RiLeafLine,
  RiShieldCheckLine,
  RiAwardLine,
  RiTruckLine,
  RiHeartLine,
} from "react-icons/ri";

/* ── Data ──────────────────────────────────────────── */
const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/aashey.consumer.products?utm_source=qr&igsh=MThqY2JiNnpwOGc2bQ==", Icon: RiInstagramLine },
  { name: "Facebook",  href: "https://www.facebook.com/share/18TMgfmNSR/",                                                   Icon: RiFacebookCircleLine },
  { name: "YouTube",   href: "https://youtube.com/@aashey",                                                                   Icon: RiYoutubeLine },
];

const quickLinks = [
  { name: "Home",       href: "/" },
  { name: "Products",   href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "About Us",   href: "/about" },
  { name: "Why Us",     href: "/why-us" },
  { name: "FAQs",       href: "/faqs" },
];

const policyLinks = [
  { name: "Shipping Policy",   href: "/shipping-policy" },
  { name: "Return Policy",     href: "/return-policy" },
  { name: "Privacy Policy",    href: "/privacy" },
  { name: "Terms & Conditions",href: "/terms" },
  { name: "Contact Us",        href: "/contact" },
];

const trustBadges = [
  { icon: RiLeafLine,          text: "100% Pure A2 Milk" },
  { icon: RiHeartLine,         text: "Bilona Hand-Churned" },
  { icon: RiShieldCheckLine,   text: "Lab Tested Every Batch" },
  { icon: RiAwardLine,         text: "FSSAI Certified" },
  { icon: RiCheckboxCircleLine,text: "Zero Preservatives" },
  { icon: RiTruckLine,         text: "Free Delivery ₹999+" },
];

const avatarInitials = ["R", "P", "A", "S", "K"];

/* ── Footer ─────────────────────────────────────────── */
export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#0A1F0F]">

      {/* ── Top gold gradient bar ── */}
      <div
        className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, transparent 0%, #C9933A 30%, #F0C96B 50%, #C9933A 70%, transparent 100%)" }}
      />

      {/* ══════════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12">

          {/* ── Brand col ──────────────────────── */}
          <div className="lg:col-span-4 flex flex-col">

            {/* Logo */}
            <Link href="/" className="inline-flex w-fit mb-6">
              <Image src="/logo.png" alt="AASHEY" width={130} height={40} className="h-9 w-auto object-contain" />
            </Link>

            {/* Quote */}
            <p className="font-cormorant italic text-[#FDF6E3]/65 text-[19px] leading-snug mb-3">
              &ldquo;Made with love, crafted with tradition.&rdquo;
            </p>
            <p className="font-sans text-[13px] text-[#FDF6E3]/45 leading-relaxed max-w-[260px]">
              Free-grazing Gir cows. Ancient Bilona method. Zero shortcuts.
              Pure ghee, exactly as nature intended.
            </p>

            {/* Divider */}
            <div className="w-10 h-px bg-[#C9933A]/30 my-6" />

            {/* Social icons */}
            <div className="flex gap-2.5">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={name}
                  className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#FDF6E3]/50 hover:bg-[#C9933A] hover:text-white hover:border-[#C9933A] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Avatars + trust count */}
            <div className="flex items-center gap-3 mt-7">
              <div className="flex -space-x-2">
                {avatarInitials.map((initial, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#0A1F0F] bg-[#C9933A]/20 flex items-center justify-center"
                    style={{ zIndex: avatarInitials.length - i }}
                  >
                    <span className="font-sans font-bold text-[10px] text-[#C9933A]">{initial}</span>
                  </div>
                ))}
              </div>
              <p className="font-sans text-[12px] text-[#FDF6E3]/45 leading-tight">
                Trusted by <span className="text-[#C9933A] font-semibold">50,000+</span><br />
                families across India
              </p>
            </div>
          </div>

          {/* ── Explore col ────────────────────── */}
          <div className="lg:col-span-2">
            <FooterColHeader>Explore</FooterColHeader>
            <ul className="space-y-0.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}
                    className="group flex items-center justify-between py-2 font-sans text-[13px] text-[#FDF6E3]/55 hover:text-[#C9933A] transition-colors duration-200">
                    {link.name}
                    <RiArrowRightUpLine className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Policies col ───────────────────── */}
          <div className="lg:col-span-3">
            <FooterColHeader>Policies & Help</FooterColHeader>
            <ul className="space-y-0.5">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}
                    className="group flex items-center justify-between py-2 font-sans text-[13px] text-[#FDF6E3]/55 hover:text-[#C9933A] transition-colors duration-200">
                    {link.name}
                    <RiArrowRightUpLine className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact col ────────────────────── */}
          <div className="lg:col-span-3">
            <FooterColHeader>Get In Touch</FooterColHeader>
            <ul className="space-y-4">

              {/* Address */}
              <ContactItem icon={RiMapPin2Line} label="Address">
                Village — Takali, Shiv Shakti Nagar,<br />
                Chalisgaon, Dist — Jalgaon,<br />
                Maharashtra — 424102
              </ContactItem>

              {/* WhatsApp */}
              <ContactItem icon={RiWhatsappLine} label="WhatsApp">
                <a href="https://wa.me/918999046484" target="_blank" rel="noopener noreferrer"
                  className="hover:text-[#C9933A] transition-colors">
                  +91 89990 46484
                </a>
              </ContactItem>

              {/* Email */}
              <ContactItem icon={RiMailLine} label="Email">
                <a href="mailto:info@aashey.com"
                  className="hover:text-[#C9933A] transition-colors">
                  info@aashey.com
                </a>
              </ContactItem>

            </ul>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TRUST BADGES BAR
      ══════════════════════════════════════════ */}
      <div className="border-t border-[#C9933A]/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {trustBadges.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-5 h-5 rounded-full bg-[#C9933A]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9933A]/20 transition-colors">
                  <Icon className="w-3 h-3 text-[#C9933A]" />
                </div>
                <span className="font-sans text-[11.5px] font-medium text-[#FDF6E3]/55 group-hover:text-[#FDF6E3]/80 transition-colors">
                  {text}
                </span>
                {i < trustBadges.length - 1 && (
                  <span className="hidden md:inline-block w-px h-3 bg-[#C9933A]/15 ml-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COPYRIGHT BAR
      ══════════════════════════════════════════ */}
      <div className="bg-[#061409] border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">

            {/* Copyright */}
            <p className="font-sans text-[11.5px] text-[#FDF6E3]/30">
              © 2026{" "}
              <span className="text-[#FDF6E3]/50 font-medium">Aashey Consumer Products Pvt. Ltd.</span>
              {" "}All rights reserved.
            </p>

            {/* FSSAI badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#C9933A]/8 border border-[#C9933A]/15 rounded-full">
              <span className="font-sans text-[10px] font-bold text-[#C9933A]/80 tracking-widest uppercase">FSSAI</span>
              <span className="w-px h-3 bg-[#C9933A]/20" />
              <span className="font-mono text-[10px] text-[#FDF6E3]/35 tracking-wide">21526073000396</span>
            </div>

            {/* Made in India + credit */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <p className="font-sans text-[11.5px] text-[#FDF6E3]/30">
                Crafted with ❤️ in India 🇮🇳
              </p>
              <span className="w-px h-3 bg-[#FDF6E3]/10 hidden sm:inline-block" />
              <a href="https://groxmedia.in/" target="_blank" rel="noopener noreferrer"
                className="font-sans text-[11.5px] text-[#FDF6E3]/35 hover:text-[#C9933A] transition-colors">
                Design by <span className="font-semibold text-[#FDF6E3]/50">Grox Media</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

/* ── Reusable sub-components ─────────────────────────── */

function FooterColHeader({ children }) {
  return (
    <div className="mb-5">
      <h4 className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#C9933A]/70 mb-2.5">
        {children}
      </h4>
      <div className="w-6 h-px bg-[#C9933A]/30" />
    </div>
  );
}

function ContactItem({ icon: Icon, label, children }) {
  return (
    <li className="flex gap-3 group">
      <div className="w-8 h-8 rounded-lg bg-[#C9933A]/8 border border-[#C9933A]/15 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#C9933A]/15 transition-colors">
        <Icon className="w-3.5 h-3.5 text-[#C9933A]" />
      </div>
      <div>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FDF6E3]/30 mb-1">
          {label}
        </p>
        <div className="font-sans text-[13px] text-[#FDF6E3]/55 leading-relaxed">
          {children}
        </div>
      </div>
    </li>
  );
}

export default Footer;