"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  Package,
  LogOut,
  MapPin,
} from "lucide-react";

// ✅ react-icons — crisp, bold icons for mobile
import { RiHomeLine, RiHomeFill } from "react-icons/ri";
import { RiShoppingBag3Line, RiShoppingBag3Fill } from "react-icons/ri";
import { RiShoppingCart2Line, RiShoppingCart2Fill } from "react-icons/ri";
import { RiUser3Line, RiUser3Fill } from "react-icons/ri";
import { RiHeartLine, RiHeartFill } from "react-icons/ri";
import { RiSearchLine } from "react-icons/ri";
import { RiMenuLine } from "react-icons/ri";
import { RiCloseLine } from "react-icons/ri";
import { RiArrowRightSLine } from "react-icons/ri";
import { RiArrowDownSLine } from "react-icons/ri";
import { RiLogoutBoxLine } from "react-icons/ri";
import { RiMapPin2Line } from "react-icons/ri";
import { RiBox3Line } from "react-icons/ri";
import { RiInstagramLine } from "react-icons/ri";
import { RiFacebookCircleLine } from "react-icons/ri";
import { RiYoutubeLine } from "react-icons/ri";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, cn } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { toast, Toaster } from "sonner";
import Image from "next/image";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, getCartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  // ── Reusable nav item for the drawer ──────────────────────────
  // Matches the "About Us / Why Choose Us" style but with an icon dot accent
  const DrawerNavItem = ({ href, icon: Icon, iconActive: IconActive, label, badge }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setIsMenuOpen(false)}
        className={cn(
          "flex items-center justify-between px-5 py-3.5 transition-all border-l-[3px]",
          active
            ? "bg-[#3F1F00]/[0.06] border-[#C9933A]"
            : "border-transparent hover:bg-[#3F1F00]/[0.04]"
        )}
      >
        <span className="flex items-center gap-3">
          {/* ── slim icon pill ── */}
          <span
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              active ? "bg-[#C9933A]/15" : "bg-[#3F1F00]/[0.07]"
            )}
          >
            {active && IconActive
              ? <IconActive className="w-[15px] h-[15px] text-[#C9933A]" />
              : <Icon className={cn("w-[15px] h-[15px]", active ? "text-[#C9933A]" : "text-[#5C3A1E]")} />
            }
          </span>

          {/* ── label — same as Company section ── */}
          <span
            className={cn(
              "font-sans text-[14px] font-medium",
              active ? "text-[#3F1F00]" : "text-[#5C3A1E]"
            )}
          >
            {label}
          </span>
        </span>

        {/* badge or chevron */}
        {badge != null && badge > 0 ? (
          <span className="bg-[#C9933A] text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {badge}
          </span>
        ) : (
          <RiArrowRightSLine className={cn("w-4 h-4", active ? "text-[#C9933A]/70" : "text-[#C9933A]/40")} />
        )}
      </Link>
    );
  };

  return (
    <>
      <header ref={navbarRef} className="sticky top-0 z-50 transition-all duration-300">
        <Toaster position="top-center" richColors />

        {/* Top Announcement Bar */}
        <div className="bg-[#092D15] h-9 overflow-hidden hidden md:flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 w-full">
            <div className="flex items-center justify-center gap-6 whitespace-nowrap">
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90">Free Delivery above ₹999</span>
              <span className="text-[#C9933A]/60 font-light">·</span>
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90">100% Pure A2 Ghee</span>
              <span className="text-[#C9933A]/60 font-light">·</span>
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90">Traditionally Bilona Crafted</span>
              <span className="text-[#C9933A]/60 font-light">·</span>
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90">Lab Tested</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className={`bg-[#FDF6E3]/95 backdrop-blur-lg border-b border-[#C9933A]/15 transition-all duration-300 ${isScrolled ? "shadow-[0_4px_32px_rgba(63,31,0,0.12)]" : "shadow-[0_2px_24px_rgba(63,31,0,0.06)]"}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
            <div className="flex items-center justify-between h-16 md:h-20">

              {/* Logo */}
              <Link href="/" className="flex-shrink-0 hover:scale-105 transition-transform duration-300">
                <Image src="/logo-2.png" alt="AASHEY" width={150} height={150} className="w-full h-8 md:h-10 object-contain" />
              </Link>

              {/* Desktop Search */}
              <div className="hidden lg:flex flex-1 max-w-sm mx-8">
                <form onSubmit={handleSearch} className="w-full relative">
                  <input
                    type="text"
                    placeholder="Search ghee, products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="brand-input pl-5 pr-12 py-2.5 rounded-full text-sm"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C9933A] hover:bg-[#3F1F00] rounded-full p-2 transition-colors">
                    <RiSearchLine className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1 md:gap-3">
                {/* Mobile search */}
                <button onClick={() => setIsSearchOpen(true)} className="lg:hidden p-2 text-[#3F1F00] hover:text-[#C9933A] transition-colors">
                  <RiSearchLine className="w-5 h-5" />
                </button>

                {/* Wishlist */}
                <Link href="/wishlist" className="hidden md:flex p-2 text-[#3F1F00] hover:text-[#C9933A] transition-colors relative group">
                  <RiHeartLine className="w-5 h-5 group-hover:hidden" />
                  <RiHeartFill className="w-5 h-5 hidden group-hover:block" />
                </Link>

                {/* Cart */}
                <ClientOnly>
                  <Link href="/cart" className="p-2 text-[#3F1F00] hover:text-[#C9933A] transition-colors relative group">
                    <RiShoppingCart2Line className="w-5 h-5" />
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#C9933A] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-sans font-bold">
                        {getCartItemCount()}
                      </span>
                    )}
                  </Link>
                </ClientOnly>

                {/* Account Dropdown */}
                <div className="relative hidden md:block" onMouseEnter={() => setActiveDropdown("account")} onMouseLeave={() => setActiveDropdown(null)}>
                  <ClientOnly>
                    {isAuthenticated ? (
                      <button className="p-2 transition-colors">
                        <div className="w-8 h-8 bg-[#C9933A] rounded-full flex items-center justify-center text-white font-sans font-bold text-xs ring-2 ring-[#C9933A] ring-offset-2 ring-offset-[#FDF6E3]">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </button>
                    ) : (
                      <Link href="/auth" className="btn-primary text-xs px-5 py-2">Login</Link>
                    )}
                    {activeDropdown === "account" && isAuthenticated && (
                      <div className="absolute right-0 top-full pt-2 z-50">
                        <div className="bg-white shadow-2xl rounded-2xl p-2 w-48 border border-[#C9933A]/20">
                          <Link href="/account" className="flex items-center gap-2 py-2.5 px-4 rounded-xl hover:bg-[#FDF6E3] font-sans text-sm text-[#3F1F00] transition-colors" onClick={() => setActiveDropdown(null)}>
                            <RiUser3Line className="w-4 h-4 text-[#C9933A]" /> My Profile
                          </Link>
                          <Link href="/account/orders" className="flex items-center gap-2 py-2.5 px-4 rounded-xl hover:bg-[#FDF6E3] font-sans text-sm text-[#3F1F00] transition-colors" onClick={() => setActiveDropdown(null)}>
                            <RiBox3Line className="w-4 h-4 text-[#C9933A]" /> My Orders
                          </Link>
                          <Link href="/account/addresses" className="flex items-center gap-2 py-2.5 px-4 rounded-xl hover:bg-[#FDF6E3] font-sans text-sm text-[#3F1F00] transition-colors" onClick={() => setActiveDropdown(null)}>
                            <RiMapPin2Line className="w-4 h-4 text-[#C9933A]" /> Addresses
                          </Link>
                          <div className="border-t border-[#C9933A]/15 my-1" />
                          <button onClick={() => { handleLogout(); setActiveDropdown(null); }} className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl hover:bg-red-50 font-sans text-sm text-red-600 transition-colors">
                            <RiLogoutBoxLine className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </ClientOnly>
                </div>

                {/* Mobile menu toggle */}
                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-[#3F1F00]">
                  <RiMenuLine className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Strip (desktop) */}
        <div className="hidden lg:block bg-[#3F1F00] h-11">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 h-full">
            <nav className="flex items-center justify-center gap-10 h-full">
              <Link href="/" className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>Home</Link>
              <Link href="/products" className={`nav-link ${pathname === "/products" ? "nav-link-active" : ""}`}>Products</Link>
              <div className="relative" onMouseEnter={() => setActiveDropdown("categories")} onMouseLeave={() => setActiveDropdown(null)}>
                <button className={`nav-link flex items-center gap-1 ${activeDropdown === "categories" ? "text-[#C9933A]" : ""}`}>
                  Categories
                  <RiArrowDownSLine className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === "categories" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "categories" && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-[#C9933A]/20 py-6 px-6 min-w-[600px]">
                      <div className="grid grid-cols-3 gap-6">
                        {(categories || []).slice(0, 3).map((cat) => (
                          <div key={cat.id} className="border-r border-[#C9933A]/15 last:border-r-0 pr-4 last:pr-0">
                            <Link href={`/category/${cat.slug}`} className="block py-2 font-playfair font-semibold text-sm text-[#3F1F00] hover:text-[#C9933A] transition-colors border-b border-[#C9933A]/20 mb-3 pb-3">
                              {cat.name}
                            </Link>
                            {cat.subCategories?.length > 0 && (
                              <ul className="space-y-2">
                                {cat.subCategories.map((sub) => (
                                  <li key={sub.id}>
                                    <Link href={`/products?category=${encodeURIComponent(cat.slug)}&subcategory=${encodeURIComponent(sub.slug)}`} className="block py-1 font-sans text-xs text-[#5C3A1E] hover:text-[#C9933A] hover:pl-1 transition-all" onClick={() => setActiveDropdown(null)}>
                                      → {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#C9933A]/20 mt-4 pt-4 text-center">
                        <Link href="/categories" className="inline-block font-sans text-sm font-semibold text-[#C9933A] hover:text-[#3F1F00] transition-colors" onClick={() => setActiveDropdown(null)}>
                          View All Categories →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/about" className={`nav-link ${pathname === "/about" ? "nav-link-active" : ""}`}>About</Link>
              <Link href="/contact" className={`nav-link ${pathname === "/contact" ? "nav-link-active" : ""}`}>Contact</Link>
              <Link href="/why-us" className={`nav-link ${pathname === "/why-us" ? "nav-link-active" : ""}`}>Why Us</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1A0A00]/60 backdrop-blur-sm lg:hidden" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-[#FDF6E3] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair font-semibold text-lg text-[#3F1F00]">Search Products</h3>
              <button onClick={() => setIsSearchOpen(false)} className="p-2 text-[#5C3A1E] hover:text-[#3F1F00]">
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search ghee, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="brand-input pl-5 pr-12 py-3 rounded-full"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C9933A] hover:bg-[#3F1F00] text-white rounded-full p-2 transition-colors">
                  <RiSearchLine className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MOBILE MENU DRAWER
      ═══════════════════════════════════════════════ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[#1A0A00]/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-[#FDF6E3] shadow-2xl flex flex-col overflow-hidden">

            {/* ── Drawer Header ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-[#3F1F00]">
              <div>
                <p className="font-cormorant italic text-[22px] text-[#C9933A] font-bold leading-none tracking-wide">AASHEY</p>
                <p className="text-[#FDF6E3]/40 text-[10px] tracking-[0.18em] font-sans uppercase mt-0.5">Pure A2 Ghee</p>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#FDF6E3] hover:bg-white/20 transition-colors">
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* ── User Block ── */}
            <ClientOnly>
              {isAuthenticated ? (
                <div className="flex-shrink-0 px-5 py-4 bg-white border-b border-[#C9933A]/15 flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#C9933A] to-[#A07020] rounded-full flex items-center justify-center text-white font-bold text-base shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-playfair font-semibold text-[#3F1F00] text-[15px] leading-tight">{user?.name || "User"}</p>
                    <p className="font-sans text-[11px] text-[#6B4423] mt-0.5">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0 px-5 py-4 border-b border-[#C9933A]/15 bg-white">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-primary rounded-xl h-10 text-sm font-semibold">Sign In / Register</Button>
                  </Link>
                </div>
              )}
            </ClientOnly>

            {/* ── Scrollable Nav ── */}
            <div className="flex-1 min-h-0 overflow-y-auto">

              {/* ── NAVIGATION Section ── */}
              <p className="px-5 pt-4 pb-2 text-[10px] font-sans font-semibold tracking-[0.2em] text-[#C9933A] uppercase">
                Navigation
              </p>

              {/* Home */}
              <DrawerNavItem
                href="/"
                icon={RiHomeLine}
                iconActive={RiHomeFill}
                label="Home"
              />

              {/* All Products */}
              <DrawerNavItem
                href="/products"
                icon={RiShoppingBag3Line}
                iconActive={RiShoppingBag3Fill}
                label="All Products"
              />

              {/* Wishlist */}
              <DrawerNavItem
                href="/wishlist"
                icon={RiHeartLine}
                iconActive={RiHeartFill}
                label="Wishlist"
              />

              {/* Cart — with badge */}
              <ClientOnly>
                <DrawerNavItem
                  href="/cart"
                  icon={RiShoppingCart2Line}
                  iconActive={RiShoppingCart2Fill}
                  label="Cart"
                  badge={getCartItemCount()}
                />
              </ClientOnly>

              {/* Categories Accordion */}
              <div className="border-l-[3px] border-transparent">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#3F1F00]/[0.04] transition-all"
                  onClick={() => setActiveDropdown((prev) => (prev === "mobile-categories" ? null : "mobile-categories"))}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#3F1F00]/[0.07] flex items-center justify-center">
                      <RiBox3Line className="w-[15px] h-[15px] text-[#5C3A1E]" />
                    </span>
                    {/* ✅ font-sans font-medium — same as Company section */}
                    <span className="font-sans text-[14px] font-medium text-[#5C3A1E]">Categories</span>
                  </span>
                  <RiArrowDownSLine className={cn("w-4 h-4 text-[#C9933A]/50 transition-transform duration-200", activeDropdown === "mobile-categories" && "rotate-180")} />
                </button>

                {activeDropdown === "mobile-categories" && categories.length > 0 && (
                  <div className="bg-[#3F1F00]/4 mx-4 mb-2 rounded-xl overflow-hidden">
                    {(categories || []).slice(0, 5).map((cat, idx) => (
                      <Link key={cat.id} href={`/category/${cat.slug}`}
                        className={`flex items-center gap-2 px-4 py-3 font-sans text-[13px] font-medium text-[#3F1F00] hover:text-[#C9933A] hover:bg-white/50 transition-all ${idx !== 0 ? "border-t border-[#C9933A]/10" : ""}`}
                        onClick={() => setIsMenuOpen(false)}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9933A]/60 flex-shrink-0" />
                        {cat.name}
                      </Link>
                    ))}
                    <Link href="/categories"
                      className="flex items-center gap-2 px-4 py-3 font-sans text-[13px] font-semibold text-[#C9933A] hover:bg-white/50 transition-all border-t border-[#C9933A]/10"
                      onClick={() => setIsMenuOpen(false)}>
                      View All Categories →
                    </Link>
                  </div>
                )}
              </div>

              {/* ── COMPANY Section ── */}
              <p className="px-5 pt-4 pb-2 text-[10px] font-sans font-semibold tracking-[0.2em] text-[#C9933A] uppercase">
                Company
              </p>

              {[
                { name: "About Us", href: "/about" },
                { name: "Why Choose Us", href: "/why-us" },
                { name: "Contact", href: "/contact" },
                { name: "FAQs", href: "/faqs" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className={`flex items-center justify-between px-5 py-3 transition-all ${pathname === item.href ? "bg-[#3F1F00]/6 border-l-[3px] border-[#C9933A]" : "border-l-[3px] border-transparent hover:bg-[#3F1F00]/4"}`}
                  onClick={() => setIsMenuOpen(false)}>
                  <span className="font-sans text-[14px] font-medium text-[#5C3A1E]">{item.name}</span>
                  <RiArrowRightSLine className="w-4 h-4 text-[#C9933A]/40" />
                </Link>
              ))}

              {/* ── MY ACCOUNT Section ── */}
              <ClientOnly>
                {isAuthenticated && (
                  <>
                    <p className="px-5 pt-4 pb-2 text-[10px] font-sans font-semibold tracking-[0.2em] text-[#C9933A] uppercase">
                      My Account
                    </p>
                    <Link href="/account" className="flex items-center justify-between px-5 py-3 border-l-[3px] border-transparent hover:bg-[#3F1F00]/4 transition-all" onClick={() => setIsMenuOpen(false)}>
                      <span className="flex items-center gap-3">
                        <RiUser3Line className="w-4 h-4 text-[#C9933A]" />
                        <span className="font-sans text-[14px] font-medium text-[#5C3A1E]">My Profile</span>
                      </span>
                      <RiArrowRightSLine className="w-4 h-4 text-[#C9933A]/40" />
                    </Link>
                    <Link href="/account/orders" className="flex items-center justify-between px-5 py-3 border-l-[3px] border-transparent hover:bg-[#3F1F00]/4 transition-all" onClick={() => setIsMenuOpen(false)}>
                      <span className="flex items-center gap-3">
                        <RiBox3Line className="w-4 h-4 text-[#C9933A]" />
                        <span className="font-sans text-[14px] font-medium text-[#5C3A1E]">My Orders</span>
                      </span>
                      <RiArrowRightSLine className="w-4 h-4 text-[#C9933A]/40" />
                    </Link>
                    <Link href="/account/addresses" className="flex items-center justify-between px-5 py-3 border-l-[3px] border-transparent hover:bg-[#3F1F00]/4 transition-all" onClick={() => setIsMenuOpen(false)}>
                      <span className="flex items-center gap-3">
                        <RiMapPin2Line className="w-4 h-4 text-[#C9933A]" />
                        <span className="font-sans text-[14px] font-medium text-[#5C3A1E]">Addresses</span>
                      </span>
                      <RiArrowRightSLine className="w-4 h-4 text-[#C9933A]/40" />
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 mt-1 hover:bg-red-50 transition-all">
                      <RiLogoutBoxLine className="w-4 h-4 text-red-400" />
                      <span className="font-sans text-[14px] font-medium text-red-400">Sign Out</span>
                    </button>
                  </>
                )}
              </ClientOnly>

              {/* Bottom padding */}
              <div className="h-6" />
            </div>

            {/* ── Drawer Footer ── */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-[#C9933A]/15 bg-white">
              <p className="text-center text-[10px] font-sans text-[#8B6040] mb-3 tracking-[0.15em] uppercase">Follow Us</p>
              <div className="flex justify-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-[#FDF6E3] border border-[#C9933A]/25 flex items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-white transition-all">
                  <RiInstagramLine className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-[#FDF6E3] border border-[#C9933A]/25 flex items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-white transition-all">
                  <RiFacebookCircleLine className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-[#FDF6E3] border border-[#C9933A]/25 flex items-center justify-center text-[#C9933A] hover:bg-[#C9933A] hover:text-white transition-all">
                  <RiYoutubeLine className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MOBILE BOTTOM NAV
      ═══════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9933A]/40 to-transparent" />

        <div className="bg-[#2A1200] grid grid-cols-4">

          {/* Home */}
          <Link href="/" className={`flex flex-col items-center justify-center pt-3 pb-2.5 gap-1 relative transition-all ${pathname === "/" ? "text-[#C9933A]" : "text-[#FDF6E3]/50 active:text-[#FDF6E3]"}`}>
            {pathname === "/" && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#C9933A]" />}
            {pathname === "/" ? <RiHomeFill className="w-[22px] h-[22px]" /> : <RiHomeLine className="w-[22px] h-[22px]" />}
            <span className={`text-[10px] font-sans font-semibold tracking-wide ${pathname === "/" ? "text-[#C9933A]" : "text-[#FDF6E3]/40"}`}>Home</span>
          </Link>

          {/* Shop */}
          <Link href="/categories" className={`flex flex-col items-center justify-center pt-3 pb-2.5 gap-1 relative transition-all ${pathname === "/categories" ? "text-[#C9933A]" : "text-[#FDF6E3]/50 active:text-[#FDF6E3]"}`}>
            {pathname === "/categories" && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#C9933A]" />}
            {pathname === "/categories" ? <RiShoppingBag3Fill className="w-[22px] h-[22px]" /> : <RiShoppingBag3Line className="w-[22px] h-[22px]" />}
            <span className={`text-[10px] font-sans font-semibold tracking-wide ${pathname === "/categories" ? "text-[#C9933A]" : "text-[#FDF6E3]/40"}`}>Shop</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className={`flex flex-col items-center justify-center pt-3 pb-2.5 gap-1 relative transition-all ${pathname === "/cart" ? "text-[#C9933A]" : "text-[#FDF6E3]/50 active:text-[#FDF6E3]"}`}>
            {pathname === "/cart" && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#C9933A]" />}
            <div className="relative">
              {pathname === "/cart" ? <RiShoppingCart2Fill className="w-[22px] h-[22px]" /> : <RiShoppingCart2Line className="w-[22px] h-[22px]" />}
              <ClientOnly>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-[#C9933A] text-white text-[9px] font-sans font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                    {getCartItemCount()}
                  </span>
                )}
              </ClientOnly>
            </div>
            <span className={`text-[10px] font-sans font-semibold tracking-wide ${pathname === "/cart" ? "text-[#C9933A]" : "text-[#FDF6E3]/40"}`}>Cart</span>
          </Link>

          {/* Account */}
          <Link href={isAuthenticated ? "/account" : "/auth"}
            className={`flex flex-col items-center justify-center pt-3 pb-2.5 gap-1 relative transition-all ${pathname.includes("/account") || pathname === "/auth" ? "text-[#C9933A]" : "text-[#FDF6E3]/50 active:text-[#FDF6E3]"}`}>
            {(pathname.includes("/account") || pathname === "/auth") && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#C9933A]" />}
            <ClientOnly>
              {isAuthenticated ? (
                <div className="w-[22px] h-[22px] bg-[#C9933A] rounded-full flex items-center justify-center text-white font-bold text-[9px]">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              ) : (
                pathname.includes("/account") || pathname === "/auth"
                  ? <RiUser3Fill className="w-[22px] h-[22px]" />
                  : <RiUser3Line className="w-[22px] h-[22px]" />
              )}
            </ClientOnly>
            <span className={`text-[10px] font-sans font-semibold tracking-wide ${pathname.includes("/account") || pathname === "/auth" ? "text-[#C9933A]" : "text-[#FDF6E3]/40"}`}>
              {isAuthenticated ? "Account" : "Login"}
            </span>
          </Link>

        </div>
      </div>
    </>
  );
}