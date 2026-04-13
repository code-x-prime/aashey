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
  Truck,
  Shield,
} from "lucide-react";
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
  const [openMobileCategoryId, setOpenMobileCategoryId] = useState(null);

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
    setOpenMobileCategoryId(null);
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

  return (
    <>
      <header ref={navbarRef} className={`sticky top-0 z-50 transition-all duration-300`}>
        <Toaster position="top-center" richColors />

        {/* Top Announcement Bar */}
        <div className="bg-[#092D15] h-9 overflow-hidden hidden md:flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 w-full">
            <div className="flex items-center justify-center gap-6 whitespace-nowrap">
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90 flex items-center gap-1.5">
                Free Delivery above ₹999
              </span>
              <span className="text-[#C9933A]/60 font-light">·</span>
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90">
                100% Pure A2 Ghee
              </span>
              <span className="text-[#C9933A]/60 font-light">·</span>
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90">
                Traditionally Bilona Crafted
              </span>
              <span className="text-[#C9933A]/60 font-light">·</span>
              <span className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#FDF6E3]/90">
                Lab Tested
              </span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className={`bg-[#FDF6E3]/95 backdrop-blur-lg border-b border-[#C9933A]/15 transition-all duration-300 ${isScrolled ? "shadow-[0_4px_32px_rgba(63,31,0,0.12)]" : "shadow-[0_2px_24px_rgba(63,31,0,0.06)]"}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
            <div className="flex items-center justify-between h-16 md:h-20">

              {/* Logo */}
              <Link href="/" className="flex-shrink-0 hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo-2.png"
                  alt="AASHEY"
                  width={150}
                  height={150}
                  className="w-full h-8 md:h-10 object-contain"
                />
              </Link>

              {/* Desktop Search - Center */}
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
                    <Search className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1 md:gap-3">
                {/* Mobile search */}
                <button onClick={() => setIsSearchOpen(true)} className="lg:hidden p-2 text-[#3F1F00] hover:text-[#C9933A] transition-colors">
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist */}
                <Link href="/wishlist" className="hidden md:flex p-2 text-[#3F1F00] hover:text-[#C9933A] transition-colors relative group">
                  <Heart className="w-5 h-5 group-hover:fill-current transition-all" />
                </Link>

                {/* Cart */}
                <ClientOnly>
                  <Link href="/cart" className="p-2 text-[#3F1F00] hover:text-[#C9933A] transition-colors relative group">
                    <ShoppingCart className="w-5 h-5" />
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
                      <Link href="/auth" className="btn-primary text-xs px-5 py-2">
                        Login
                      </Link>
                    )}

                    {activeDropdown === "account" && isAuthenticated && (
                      <div className="absolute right-0 top-full pt-2 z-50">
                        <div className="bg-white shadow-2xl rounded-2xl p-2 w-48 border border-[#C9933A]/20">
                          <Link href="/account" className="flex items-center gap-2 py-2.5 px-4 rounded-xl hover:bg-[#FDF6E3] font-sans text-sm text-[#3F1F00] transition-colors" onClick={() => setActiveDropdown(null)}>
                            <User className="w-4 h-4 text-[#C9933A]" /> My Profile
                          </Link>
                          <Link href="/account/orders" className="flex items-center gap-2 py-2.5 px-4 rounded-xl hover:bg-[#FDF6E3] font-sans text-sm text-[#3F1F00] transition-colors" onClick={() => setActiveDropdown(null)}>
                            <Package className="w-4 h-4 text-[#C9933A]" /> My Orders
                          </Link>
                          <Link href="/account/addresses" className="flex items-center gap-2 py-2.5 px-4 rounded-xl hover:bg-[#FDF6E3] font-sans text-sm text-[#3F1F00] transition-colors" onClick={() => setActiveDropdown(null)}>
                            <MapPin className="w-4 h-4 text-[#C9933A]" /> Addresses
                          </Link>
                          <div className="border-t border-[#C9933A]/15 my-1" />
                          <button onClick={() => { handleLogout(); setActiveDropdown(null); }} className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl hover:bg-red-50 font-sans text-sm text-red-600 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </ClientOnly>
                </div>

                {/* Mobile menu toggle */}
                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-[#3F1F00]">
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Strip (desktop) */}
        <div className="hidden lg:block bg-[#3F1F00] h-11">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 h-full">
            <nav className="flex items-center justify-center gap-10 h-full">
              <Link href="/" className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>
                Home
              </Link>
              <Link href="/products" className={`nav-link ${pathname === "/products" ? "nav-link-active" : ""}`}>
                Products
              </Link>
              <div className="relative" onMouseEnter={() => setActiveDropdown("categories")} onMouseLeave={() => setActiveDropdown(null)}>
                <button className={`nav-link flex items-center gap-1 ${activeDropdown === "categories" ? "text-[#C9933A]" : ""}`}>
                  Categories
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === "categories" ? "rotate-180" : ""}`} />
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
              <Link href="/about" className={`nav-link ${pathname === "/about" ? "nav-link-active" : ""}`}>
                About
              </Link>
              <Link href="/contact" className={`nav-link ${pathname === "/contact" ? "nav-link-active" : ""}`}>
                Contact
              </Link>
              <Link href="/why-us" className={`nav-link ${pathname === "/why-us" ? "nav-link-active" : ""}`}>
                Why Us
              </Link>
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
                <X className="w-5 h-5" />
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
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[#1A0A00]/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#FDF6E3] shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 bg-[#3F1F00]">
              <span className="font-cormorant italic text-2xl text-[#C9933A] font-bold">AASHEY</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-1.5 text-[#FDF6E3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ClientOnly>
              {isAuthenticated ? (
                <div className="flex-shrink-0 p-4 bg-white border-b border-[#C9933A]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C9933A] rounded-full flex items-center justify-center text-[#3F1F00] font-sans font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-playfair font-semibold text-[#3F1F00] text-sm">{user?.name || "User"}</p>
                      <p className="font-sans text-xs text-[#6B4423]">{user?.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0 p-5 pt-4 border-b border-[#C9933A]/20">
                  <Link href="/auth" className="block mb-3" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-primary rounded-xl h-10">Sign In</Button>
                  </Link>
                </div>
              )}
            </ClientOnly>

            {/* Nav Items */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {[
                { name: "Home", href: "/" },
                { name: "All Products", href: "/products" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between py-3.5 px-6 border-b border-[#C9933A]/10 font-playfair text-base text-[#3F1F00] hover:bg-[#3F1F00]/5 hover:text-[#C9933A] transition-all" onClick={() => setIsMenuOpen(false)}>
                  {item.name}
                  <ChevronDown className="w-4 h-4 text-[#C9933A]/40 -rotate-90" />
                </Link>
              ))}

              {/* Mobile Categories Accordion */}
              <div className="border-b border-[#C9933A]/10">
                <button
                  type="button"
                  className="w-full flex items-center justify-between py-3.5 px-6 font-playfair text-base text-[#3F1F00] hover:bg-[#3F1F00]/5 hover:text-[#C9933A] text-left transition-all"
                  onClick={() => setActiveDropdown((prev) => (prev === "mobile-categories" ? null : "mobile-categories"))}
                >
                  <span>Categories</span>
                  <ChevronDown className={cn("w-4 h-4 text-[#C9933A]/40 transition-transform", activeDropdown === "mobile-categories" && "rotate-180")} />
                </button>
                {activeDropdown === "mobile-categories" && categories.length > 0 && (
                  <div className="bg-white pl-8 pr-4 pb-3 space-y-1">
                    {(categories || []).slice(0, 5).map((cat) => (
                      <Link key={cat.id} href={`/category/${cat.slug}`} className="block py-2 font-sans text-sm text-[#3F1F00] hover:text-[#C9933A] border-b border-[#C9933A]/10 last:border-0 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        {cat.name}
                      </Link>
                    ))}
                    <Link href="/categories" className="block py-2 font-sans text-sm font-semibold text-[#C9933A] hover:text-[#3F1F00]" onClick={() => setIsMenuOpen(false)}>
                      View All →
                    </Link>
                  </div>
                )}
              </div>

              {[
                { name: "Wishlist", href: "/wishlist", icon: Heart },
                { name: "Cart", href: "/cart", icon: ShoppingCart },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "Why Us", href: "/why-us" },
                { name: "FAQs", href: "/faqs" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between py-3.5 px-6 border-b border-[#C9933A]/10 font-playfair text-base text-[#3F1F00] hover:bg-[#3F1F00]/5 hover:text-[#C9933A] transition-all" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4 text-[#C9933A]" />}
                    {item.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#C9933A]/40 -rotate-90" />
                </Link>
              ))}

              <ClientOnly>
                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-[#C9933A]/20 px-6">
                    <p className="font-sc text-xs tracking-[0.2em] text-[#C9933A] uppercase mb-3">Account</p>
                    <Link href="/account" className="block py-2.5 font-sans text-sm text-[#3F1F00] hover:text-[#C9933A] transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/account/orders" className="block py-2.5 font-sans text-sm text-[#3F1F00] hover:text-[#C9933A] transition-colors" onClick={() => setIsMenuOpen(false)}>
                      My Orders
                    </Link>
                    <Link href="/account/addresses" className="block py-2.5 font-sans text-sm text-[#3F1F00] hover:text-[#C9933A] transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Addresses
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left py-2.5 font-sans text-sm text-red-400/80 hover:text-red-400 font-medium transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </ClientOnly>
            </div>

            {/* Drawer bottom */}
            <div className="flex-shrink-0 p-5 border-t border-[#C9933A]/20 bg-white">
              <div className="flex justify-center gap-3">
                {["Instagram", "Facebook", "YouTube"].map((social) => (
                  <span key={social} className="w-8 h-8 rounded-full bg-[#FDF6E3] flex items-center justify-center text-[#C9933A] text-xs font-sans font-bold">
                    {social[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#3F1F00] border-t border-[#C9933A]/30 z-50 safe-area-pb">
        <div className="grid grid-cols-4">
          <Link href="/" className={`flex flex-col items-center justify-center py-3 transition-colors ${pathname === "/" ? "text-[#C9933A]" : "text-[#FDF6E3]/70 hover:text-[#FDF6E3]"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-sc text-[9px] mt-1 tracking-wider">Home</span>
          </Link>
          <Link href="/categories" className={`flex flex-col items-center justify-center py-3 transition-colors ${pathname === "/categories" ? "text-[#C9933A]" : "text-[#FDF6E3]/70 hover:text-[#FDF6E3]"}`}>
            <Package className="w-5 h-5" />
            <span className="font-sc text-[9px] mt-1 tracking-wider">Shop</span>
          </Link>
          <Link href="/cart" className={`flex flex-col items-center justify-center py-3 relative transition-colors ${pathname === "/cart" ? "text-[#C9933A]" : "text-[#FDF6E3]/70 hover:text-[#FDF6E3]"}`}>
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <ClientOnly>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-[#C9933A] text-[#3F1F00] text-[8px] font-sans font-bold rounded-full flex items-center justify-center px-0.5">
                    {getCartItemCount()}
                  </span>
                )}
              </ClientOnly>
            </div>
            <span className="font-sc text-[9px] mt-1 tracking-wider">Cart</span>
          </Link>
          <Link href={isAuthenticated ? "/account" : "/auth"} className={`flex flex-col items-center justify-center py-3 transition-colors ${pathname.includes("/account") || pathname === "/auth" ? "text-[#C9933A]" : "text-[#FDF6E3]/70 hover:text-[#FDF6E3]"}`}>
            <User className="w-5 h-5" />
            <span className="font-sc text-[9px] mt-1 tracking-wider">Account</span>
          </Link>
        </div>
      </div>
    </>
  );
}
