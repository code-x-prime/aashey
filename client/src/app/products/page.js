"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/client-only";
import { toast } from "sonner";
import { ProductCard, ProductListCard } from "@/components/products/ProductCard";

import {
    RiSearchLine,
    RiFilterLine,
    RiCloseLine,
    RiArrowDownSLine,
    RiArrowUpSLine,
    RiArrowRightSLine,
    RiGridLine,
    RiListUnordered,
    RiAlertLine,
    RiLoader4Line,
    RiEqualizerLine,
    RiStarLine,
} from "react-icons/ri";

/* ═══════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════ */
function ProductCardSkeleton() {
    return (
        <div className="bg-white overflow-hidden rounded-2xl animate-pulse border border-[#C9933A]/12">
            <div className="aspect-[4/5] w-full bg-[#C9933A]/8" />
            <div className="p-4 space-y-2">
                <div className="h-2.5 w-16 bg-[#C9933A]/12 rounded-full" />
                <div className="h-4 w-full bg-[#C9933A]/10 rounded" />
                <div className="h-5 w-20 bg-[#C9933A]/15 rounded mt-3" />
            </div>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="flex bg-white border border-[#C9933A]/12 rounded-2xl overflow-hidden animate-pulse">
            <div className="w-32 h-32 flex-shrink-0 bg-[#C9933A]/10" />
            <div className="flex-1 p-4 space-y-2.5">
                <div className="h-2.5 bg-[#C9933A]/10 rounded w-1/4" />
                <div className="h-4 bg-[#C9933A]/12 rounded w-3/4" />
                <div className="h-5 bg-[#C9933A]/10 rounded w-1/3 mt-3" />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   FILTER SECTION ACCORDION
═══════════════════════════════════════════════ */
function FilterSection({ title, isOpen, onToggle, children, hasActive }) {
    return (
        <div className="border-b border-[#C9933A]/10 last:border-b-0">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#FDF6E3]/60 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="font-sans text-[11.5px] font-semibold tracking-[0.14em] uppercase text-[#3F1F00]">
                        {title}
                    </span>
                    {hasActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9933A] flex-shrink-0" />
                    )}
                </div>
                {isOpen
                    ? <RiArrowUpSLine className="w-4 h-4 text-[#C9933A]" />
                    : <RiArrowDownSLine className="w-4 h-4 text-[#C9933A]/60" />
                }
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-4 pb-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   ACTIVE FILTER CHIP
═══════════════════════════════════════════════ */
function FilterChip({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 bg-[#3F1F00] text-[#FDF6E3] text-[11px] font-sans font-medium px-2.5 py-1 rounded-full">
            {label}
            <button onClick={onRemove} className="hover:text-[#C9933A] transition-colors ml-0.5">
                <RiCloseLine className="w-3 h-3" />
            </button>
        </span>
    );
}

/* ═══════════════════════════════════════════════
   CHECKBOX ITEM
═══════════════════════════════════════════════ */
function CheckItem({ checked, label, onClick, color }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2.5 py-1.5 cursor-pointer group transition-colors ${checked ? "text-[#C9933A]" : "text-[#5C3A1E] hover:text-[#3F1F00]"}`}
        >
            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-[#C9933A] border-[#C9933A]" : "border-[#C9933A]/30 group-hover:border-[#C9933A]/60"}`}>
                {checked && <RiCloseLine className="w-2.5 h-2.5 text-white rotate-45 hidden" />}
                {checked && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
            </div>
            {color && (
                <div className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: color }} />
            )}
            <span className="font-sans text-[13px]">{label}</span>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN CONTENT
═══════════════════════════════════════════════ */
function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const decodePlus = (str) => (str ? str.replace(/\+/g, " ") : "");
    const searchQuery = decodePlus(searchParams.get("search") || "");
    const categorySlug = searchParams.get("category") || "";
    const subcategorySlug = searchParams.get("subcategory") || "";
    const productType = searchParams.get("productType") || "";
    const colorId = searchParams.get("color") || "";
    const sizeId = searchParams.get("size") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const sortParam = searchParams.get("sort") || "createdAt";
    const orderParam = searchParams.get("order") || "desc";
    const viewMode = searchParams.get("view") || "grid";

    const handleViewChange = (mode) => {
        const p = new URLSearchParams(searchParams.toString());
        if (mode === "grid") { p.delete("view"); } else { p.set("view", mode); }
        router.push(`?${p.toString()}`, { scroll: false });
    };

    const getInitialActiveSection = () => {
        if (searchQuery) return "search";
        if (categorySlug || subcategorySlug) return "categories";
        if (colorId) return "colors";
        if (sizeId) return "sizes";
        return "search";
    };

    const [activeFilterSection, setActiveFilterSection] = useState(getInitialActiveSection());
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [allAttributes, setAllAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [selectedColors, setSelectedColors] = useState(colorId ? [colorId] : []);
    const [selectedSizes, setSelectedSizes] = useState(sizeId ? [sizeId] : []);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);
    const [searchInput, setSearchInput] = useState(searchQuery);

    const [filters, setFilters] = useState({
        search: searchQuery,
        category: categorySlug,
        subcategory: subcategorySlug,
        productType,
        color: colorId,
        size: sizeId,
        minPrice,
        maxPrice,
        sort: sortParam,
        order: orderParam,
    });

    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

    useEffect(() => { setSearchInput(filters.search || ""); }, [filters.search]);

    // Sync filters from URL
    useEffect(() => {
        const next = { search: searchQuery, category: categorySlug, subcategory: subcategorySlug, productType, color: colorId, size: sizeId, minPrice, maxPrice, sort: sortParam, order: orderParam };
        const isSame = JSON.stringify(next) === JSON.stringify({ search: filters.search, category: filters.category, subcategory: filters.subcategory, productType: filters.productType, color: filters.color, size: filters.size, minPrice: String(filters.minPrice || ""), maxPrice: String(filters.maxPrice || ""), sort: filters.sort, order: filters.order });
        if (!isSame) {
            setFilters(next);
            setSelectedColors(colorId ? [colorId] : []);
            setSelectedSizes(sizeId ? [sizeId] : []);
            setPagination((p) => ({ ...p, page: 1 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, categorySlug, subcategorySlug, productType, colorId, sizeId, minPrice, maxPrice, sortParam, orderParam]);

    const toggleFilterSection = (section) => setActiveFilterSection((p) => (p === section ? "" : section));

    const updateURL = (newFilters) => {
        const pairs = [];
        const add = (k, v) => { if (v !== undefined && v !== null && v !== "") pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v)).replace(/%20/g, "+")}`); };
        add("search", newFilters.search); add("category", newFilters.category); add("subcategory", newFilters.subcategory);
        add("productType", newFilters.productType); add("color", newFilters.color); add("size", newFilters.size);
        add("minPrice", newFilters.minPrice); add("maxPrice", newFilters.maxPrice);
        if (newFilters.sort !== "createdAt" || newFilters.order !== "desc") { add("sort", newFilters.sort); add("order", newFilters.order); }
        const qs = pairs.join("&");
        router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    };

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let response;
                if (filters.productType) {
                    const qp = new URLSearchParams();
                    qp.append("limit", String(pagination.limit * pagination.page));
                    response = await fetchApi(`/public/products/type/${filters.productType}?${qp.toString()}`);
                    const all = response.data?.products || [];
                    const start = (pagination.page - 1) * pagination.limit;
                    setProducts(all.slice(start, start + pagination.limit));
                    setPagination({ page: pagination.page, limit: pagination.limit, total: all.length, pages: Math.ceil(all.length / pagination.limit) });
                } else {
                    const qp = new URLSearchParams();
                    qp.append("page", String(pagination.page)); qp.append("limit", String(pagination.limit));
                    const validSort = ["createdAt", "updatedAt", "name", "featured"];
                    qp.append("sort", validSort.includes(filters.sort) ? filters.sort : "createdAt");
                    qp.append("order", filters.order);
                    if (filters.search) qp.append("search", filters.search);
                    if (filters.category) qp.append("category", filters.category);
                    if (filters.subcategory) qp.append("subcategory", filters.subcategory);
                    if (filters.minPrice) qp.append("minPrice", filters.minPrice);
                    if (filters.maxPrice) qp.append("maxPrice", filters.maxPrice);
                    const attrIds = new Set();
                    selectedColors.forEach((id) => attrIds.add(id));
                    selectedSizes.forEach((id) => attrIds.add(id));
                    Object.keys(selectedAttributes).forEach((k) => { if (k !== "color" && k !== "size") selectedAttributes[k]?.forEach((id) => attrIds.add(id)); });
                    if (selectedColors.length > 0) qp.append("color", selectedColors[0]);
                    if (selectedSizes.length > 0) qp.append("size", selectedSizes[0]);
                    if (attrIds.size > 0) qp.append("attributeValueIds", [...attrIds].join(","));
                    response = await fetchApi(`/public/products?${qp.toString()}`);
                    setProducts(response.data.products || []);
                    setPagination(response.data.pagination || {});
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters, pagination.page, pagination.limit, selectedColors, selectedSizes, selectedAttributes]);

    // Fetch filter options
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [catRes, attrRes] = await Promise.all([fetchApi("/public/categories"), fetchApi("/public/filter-attributes")]);
                setCategories(catRes.data.categories || []);
                setColors(attrRes.data.colors || []);
                setSizes(attrRes.data.sizes || []);
                if (attrRes.data.attributes && Array.isArray(attrRes.data.attributes)) {
                    setAllAttributes(attrRes.data.attributes);
                } else {
                    const attrs = [];
                    if (attrRes.data.colors?.length) attrs.push({ id: "color-attr", name: "Color", values: attrRes.data.colors });
                    if (attrRes.data.sizes?.length) attrs.push({ id: "size-attr", name: "Size", values: attrRes.data.sizes });
                    setAllAttributes(attrs);
                }
            } catch (err) { console.error("Error fetching filter options:", err); }
        };
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        fetchApi("/public/products/max-price")
            .then((r) => setMaxPossiblePrice(Math.ceil((r.data.maxPrice || 1000) / 100) * 100))
            .catch(() => setMaxPossiblePrice(1000));
    }, []);

    useEffect(() => { if (error) toast.error("Error loading products. Please try again."); }, [error]);

    useEffect(() => {
        let r1, r2, t;
        r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => { t = setTimeout(() => { const el = document.getElementById("products-main"); el ? el.scrollIntoView({ behavior: "smooth", block: "start" }) : window.scrollTo({ top: 0, behavior: "smooth" }); }, 80); }); });
        return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t); };
    }, [pagination.page]);

    const handleFilterChange = (name, value) => {
        if ((name === "minPrice" || name === "maxPrice") && value !== "") {
            const n = parseFloat(value); if (isNaN(n)) return; value = n.toString();
        }
        const newFilters = { ...filters, [name]: value };
        if (name === "category") newFilters.subcategory = "";
        setFilters(newFilters); updateURL(newFilters);
        if (pagination.page !== 1) setPagination((p) => ({ ...p, page: 1 }));
        if (mobileFiltersOpen && window.innerWidth < 768 && name !== "minPrice" && name !== "maxPrice" && name !== "search") setMobileFiltersOpen(false);
    };

    const handleAttributeValueChange = (attributeName, attributeValueId) => {
        const key = attributeName.toLowerCase();
        const cur = selectedAttributes[key] || [];
        const updated = cur.includes(attributeValueId) ? cur.filter((id) => id !== attributeValueId) : [attributeValueId];
        setSelectedAttributes((p) => ({ ...p, [key]: updated }));
        if (key === "color") { setSelectedColors(updated); handleFilterChange("color", updated[0] || ""); }
        else if (key === "size") { setSelectedSizes(updated); handleFilterChange("size", updated[0] || ""); }
    };

    const clearFilters = () => {
        const c = { search: "", category: "", subcategory: "", productType: "", color: "", size: "", minPrice: "", maxPrice: "", sort: "createdAt", order: "desc" };
        setFilters(c); setSelectedColors([]); setSelectedSizes([]); setSelectedAttributes({});
        updateURL(c); setPagination((p) => ({ ...p, page: 1 })); setActiveFilterSection("search");
    };

    const handleSortChange = (e) => {
        const v = e.target.value;
        const map = { newest: ["createdAt", "desc"], oldest: ["createdAt", "asc"], "price-low": ["createdAt", "asc"], "price-high": ["createdAt", "desc"], "name-asc": ["name", "asc"], "name-desc": ["name", "desc"] };
        const [sort, order] = map[v] || ["createdAt", "desc"];
        const nf = { ...filters, sort, order }; setFilters(nf); updateURL(nf);
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.pages) return;
        setPagination((p) => ({ ...p, page }));
    };

    const hasActiveFilters = !!(filters.search || filters.category || filters.subcategory || selectedColors.length || selectedSizes.length || filters.minPrice || filters.maxPrice);

    const sortValue = (() => {
        if (filters.sort === "name" && filters.order === "asc") return "name-asc";
        if (filters.sort === "name" && filters.order === "desc") return "name-desc";
        if (filters.sort === "createdAt" && filters.order === "asc") return "oldest";
        return "newest";
    })();

    /* ── Sidebar inner ── */
    const SidebarContent = () => (
        <div className="bg-white rounded-2xl border border-[#C9933A]/15 overflow-hidden sticky top-32"
            style={{ boxShadow: "0 4px 24px rgba(63,31,0,0.06)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#C9933A]/12 bg-[#FDF6E3]/50">
                <div className="flex items-center gap-2">
                    <RiEqualizerLine className="w-4 h-4 text-[#C9933A]" />
                    <span className="font-cormorant font-bold text-[#3F1F00] text-[16px]">Filters</span>
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="font-sans text-[11px] font-semibold text-[#C9933A] hover:text-[#3F1F00] transition-colors">
                            Clear all
                        </button>
                    )}
                    <button className="md:hidden w-7 h-7 rounded-full bg-[#3F1F00]/8 flex items-center justify-center" onClick={() => setMobileFiltersOpen(false)}>
                        <RiCloseLine className="w-4 h-4 text-[#3F1F00]" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <FilterSection title="Search" isOpen={activeFilterSection === "search"} onToggle={() => toggleFilterSection("search")} hasActive={!!filters.search}>
                <form onSubmit={(e) => { e.preventDefault(); handleFilterChange("search", searchInput); }} className="relative mt-1">
                    <input
                        type="text"
                        placeholder="Search ghee..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 border border-[#C9933A]/25 rounded-lg bg-[#FDF6E3]/60 font-sans text-[13px] text-[#3F1F00] placeholder:text-[#B89070] focus:border-[#C9933A] focus:ring-1 focus:ring-[#C9933A]/20 outline-none transition-all"
                    />
                    <button type="submit" className="absolute left-2.5 top-1/2 -translate-y-1/2">
                        <RiSearchLine className="w-3.5 h-3.5 text-[#C9933A]/60" />
                    </button>
                </form>
            </FilterSection>

            {/* Categories */}
            <FilterSection title="Categories" isOpen={activeFilterSection === "categories"} onToggle={() => toggleFilterSection("categories")} hasActive={!!(filters.category || filters.subcategory)}>
                <div className="space-y-1 max-h-60 overflow-y-auto mt-1">
                    {categories.map((cat) => (
                        <div key={cat.id}>
                            <div
                                onClick={() => handleFilterChange("category", cat.slug)}
                                className={`flex items-center gap-1.5 py-1.5 cursor-pointer text-[13px] font-sans transition-colors ${filters.category === cat.slug && !filters.subcategory ? "text-[#C9933A] font-semibold" : "text-[#5C3A1E] hover:text-[#3F1F00]"}`}
                            >
                                <RiArrowRightSLine className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${filters.category === cat.slug ? "rotate-90 text-[#C9933A]" : "text-[#C9933A]/40"}`} />
                                {cat.name}
                            </div>
                            {cat.subCategories?.length > 0 && (
                                <div className="ml-5 space-y-0.5 mb-1">
                                    {cat.subCategories.map((sub) => (
                                        <div
                                            key={sub.id}
                                            onClick={() => { const nf = { ...filters, category: cat.slug, subcategory: sub.slug }; setFilters(nf); updateURL(nf); setPagination((p) => ({ ...p, page: 1 })); }}
                                            className={`py-1 cursor-pointer font-sans text-[12.5px] transition-colors ${filters.subcategory === sub.slug ? "text-[#C9933A] font-medium" : "text-[#5C3A1E]/70 hover:text-[#3F1F00]"}`}
                                        >
                                            {sub.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </FilterSection>

            {/* Dynamic attributes */}
            {allAttributes.map((attr) => {
                const key = attr.name.toLowerCase();
                const sectionKey = `${key}s`;
                const isOpen = activeFilterSection === sectionKey;
                const selVals = key === "color" ? selectedColors : key === "size" ? selectedSizes : (selectedAttributes[key] || []);
                const hasActive = selVals.length > 0;

                return (
                    <FilterSection key={attr.id} title={attr.name} isOpen={isOpen} onToggle={() => toggleFilterSection(sectionKey)} hasActive={hasActive}>
                        <div className="space-y-0.5 max-h-56 overflow-y-auto mt-1">
                            {attr.values.map((val) => (
                                <CheckItem
                                    key={val.id}
                                    checked={selVals.includes(val.id)}
                                    label={val.display || val.name}
                                    color={val.hexCode}
                                    onClick={() => handleAttributeValueChange(attr.name, val.id)}
                                />
                            ))}
                        </div>
                    </FilterSection>
                );
            })}
        </div>
    );

    return (
        <div id="products-main" className="min-h-screen bg-[#FDF6E3]">
            <div className="mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-6 md:py-10">

                {/* ── Hero Banner ──────────────────────── */}
                <div className="relative w-full h-[200px] md:h-[300px] mb-8 md:mb-10 rounded-2xl overflow-hidden border border-[#C9933A]/20"
                    style={{ boxShadow: "0 8px 40px rgba(63,31,0,0.14)" }}>
                    <Image src="/banner-background.jpg" alt="Premium A2 Ghee" fill className="object-cover object-top" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3F1F00]/95 via-[#3F1F00]/60 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-14 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9933A]/20 backdrop-blur-sm border border-[#C9933A]/40 rounded-full text-[#C9933A] text-[11px] font-sans font-semibold tracking-wide w-fit mb-4">
                            <RiStarLine className="w-3 h-3" /> 100% Pure A2 Ghee
                        </div>
                        <h1 className="font-cormorant text-3xl md:text-5xl font-bold text-[#FDF6E3] leading-tight mb-2">
                            All Products
                        </h1>
                        <p className="font-sans text-[13px] md:text-base text-[#FDF6E3]/70 leading-relaxed">
                            Discover our collection of pure A2 ghee, handcrafted using the traditional Bilona method.
                        </p>
                    </div>
                </div>

                {/* ── Mobile filter toggle ──────────────── */}
                <div className="md:hidden flex items-center justify-between mb-5">
                    <p className="font-cormorant font-bold text-xl text-[#3F1F00]">
                        {loading ? "Loading..." : `${pagination.total || 0} Products`}
                    </p>
                    <button
                        onClick={() => setMobileFiltersOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-sans text-[13px] font-medium transition-all ${hasActiveFilters ? "bg-[#3F1F00] text-[#FDF6E3] border-[#3F1F00]" : "bg-white text-[#3F1F00] border-[#C9933A]/30"}`}
                    >
                        <RiFilterLine className="w-4 h-4" />
                        Filters {hasActiveFilters && <span className="bg-[#C9933A] text-[#3F1F00] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{[filters.search, filters.category, filters.subcategory, ...selectedColors, ...selectedSizes].filter(Boolean).length}</span>}
                    </button>
                </div>

                {/* ── Main layout ──────────────────────── */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">

                    {/* ── Sidebar desktop ── */}
                    <div className="hidden md:block md:w-[240px] lg:w-[220px] flex-shrink-0">
                        <SidebarContent />
                    </div>

                    {/* ── Mobile sidebar overlay ── */}
                    {mobileFiltersOpen && (
                        <div className="fixed inset-0 z-[60] md:hidden">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                            <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-[#FDF6E3] overflow-y-auto">
                                <SidebarContent />
                            </div>
                        </div>
                    )}

                    {/* ── Products area ────────────────────── */}
                    <div className="flex-1 min-w-0">

                        {/* Top bar: count + view + sort */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            {/* Count */}
                            <p className="font-sans text-[13px] text-[#6B4423]">
                                {loading && !products.length
                                    ? <span className="inline-block h-4 w-32 bg-[#C9933A]/15 rounded animate-pulse" />
                                    : <><span className="font-semibold text-[#3F1F00]">{products.length}</span> of <span className="font-semibold text-[#3F1F00]">{pagination.total || 0}</span> products</>
                                }
                                {loading && products.length > 0 && (
                                    <RiLoader4Line className="inline-block w-3.5 h-3.5 text-[#C9933A] animate-spin ml-2" />
                                )}
                            </p>

                            <div className="flex items-center gap-2">
                                {/* View toggle */}
                                <div className="flex items-center bg-white rounded-xl p-1 border border-[#C9933A]/15 gap-0.5">
                                    <button
                                        onClick={() => handleViewChange("grid")}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-[#3F1F00] text-[#FDF6E3]" : "text-[#8B6040] hover:text-[#3F1F00]"}`}
                                    >
                                        <RiGridLine className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleViewChange("list")}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === "list" ? "bg-[#3F1F00] text-[#FDF6E3]" : "text-[#8B6040] hover:text-[#3F1F00]"}`}
                                    >
                                        <RiListUnordered className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Sort */}
                                <div className="flex items-center bg-white rounded-xl border border-[#C9933A]/15 overflow-hidden">
                                    <span className="px-3 font-sans text-[11px] font-semibold tracking-widest text-[#8B6040] uppercase bg-[#FDF6E3]/60 border-r border-[#C9933A]/15 py-2.5 hidden sm:block">
                                        Sort
                                    </span>
                                    <select
                                        value={sortValue}
                                        onChange={handleSortChange}
                                        disabled={loading}
                                        className="px-3 py-2.5 font-sans text-[13px] text-[#3F1F00] bg-transparent outline-none cursor-pointer pr-8 appearance-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23C9933A' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                                    >
                                        <option value="newest">Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="name-asc">A → Z</option>
                                        <option value="name-desc">Z → A</option>
                                        <option value="oldest">Oldest</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Active filter chips */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-white rounded-2xl border border-[#C9933A]/12">
                                <span className="font-sans text-[11px] font-bold text-[#8B6040] uppercase tracking-wider mr-1">Active:</span>
                                {filters.search && <FilterChip label={`"${filters.search}"`} onRemove={() => handleFilterChange("search", "")} />}
                                {filters.category && <FilterChip label={categories.find((c) => c.slug === filters.category)?.name || filters.category} onRemove={() => { handleFilterChange("category", ""); handleFilterChange("subcategory", ""); }} />}
                                {filters.subcategory && (() => { const cat = categories.find((c) => c.slug === filters.category); const sub = cat?.subCategories?.find((s) => s.slug === filters.subcategory); return <FilterChip label={sub?.name || filters.subcategory} onRemove={() => handleFilterChange("subcategory", "")} />; })()}
                                {selectedColors.map((id) => <FilterChip key={id} label={colors.find((c) => c.id === id)?.name || id} onRemove={() => { setSelectedColors([]); handleFilterChange("color", ""); }} />)}
                                {selectedSizes.map((id) => <FilterChip key={id} label={sizes.find((s) => s.id === id)?.display || sizes.find((s) => s.id === id)?.name || id} onRemove={() => { setSelectedSizes([]); handleFilterChange("size", ""); }} />)}
                                {(filters.minPrice || filters.maxPrice) && <FilterChip label={`₹${filters.minPrice || 0} – ₹${filters.maxPrice || "∞"}`} onRemove={() => { handleFilterChange("minPrice", ""); handleFilterChange("maxPrice", ""); }} />}
                                <button onClick={clearFilters} className="font-sans text-[11px] font-semibold text-[#C9933A] hover:text-[#3F1F00] ml-1 transition-colors">Clear all</button>
                            </div>
                        )}

                        {/* Products grid / list */}
                        {loading && products.length === 0 ? (
                            viewMode === "grid"
                                ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">{[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}</div>
                                : <div className="flex flex-col gap-3">{[...Array(8)].map((_, i) => <ListSkeleton key={i} />)}</div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#C9933A]/12 text-center px-6">
                                <div className="w-16 h-16 rounded-2xl bg-[#C9933A]/8 border border-[#C9933A]/15 flex items-center justify-center mb-4">
                                    <RiAlertLine className="w-7 h-7 text-[#C9933A]/60" />
                                </div>
                                <h2 className="font-cormorant font-bold text-2xl text-[#3F1F00] mb-2">No products found</h2>
                                <p className="font-sans text-[13px] text-[#8B6040] max-w-xs leading-relaxed mb-6">
                                    Try adjusting your filters or search term to find what you&apos;re looking for.
                                </p>
                                <button onClick={clearFilters} className="btn-primary text-sm px-6 py-2.5">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {loading ? [...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />) : products.map((p) => <ProductCard key={p.id} product={p} />)}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {loading ? [...Array(8)].map((_, i) => <ListSkeleton key={i} />) : products.map((p) => <ProductListCard key={p.id} product={p} />)}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-1.5 mt-10">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1 || loading}
                                    className="w-9 h-9 rounded-xl border border-[#C9933A]/25 flex items-center justify-center text-[#3F1F00] hover:bg-[#FDF6E3] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <RiArrowDownSLine className="w-4 h-4 rotate-90" />
                                </button>

                                {[...Array(pagination.pages)].map((_, i) => {
                                    const page = i + 1;
                                    const show = page === 1 || page === pagination.pages || (page >= pagination.page - 1 && page <= pagination.page + 1);
                                    const dots = (page === 2 && pagination.page > 3) || (page === pagination.pages - 1 && pagination.page < pagination.pages - 2);
                                    if (dots) return <span key={page} className="w-9 h-9 flex items-center justify-center text-[#8B6040] text-sm">…</span>;
                                    if (!show) return null;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            disabled={loading}
                                            className={`w-9 h-9 rounded-xl font-sans text-[13px] font-medium transition-all ${pagination.page === page ? "bg-[#3F1F00] text-[#FDF6E3] border border-[#3F1F00]" : "border border-[#C9933A]/25 text-[#3F1F00] hover:bg-[#FDF6E3]"}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages || loading}
                                    className="w-9 h-9 rounded-xl border border-[#C9933A]/25 flex items-center justify-center text-[#3F1F00] hover:bg-[#FDF6E3] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <RiArrowUpSLine className="w-4 h-4 rotate-90" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   PAGE EXPORT
═══════════════════════════════════════════════ */
const Fallback = () => (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="text-center">
            <RiLoader4Line className="w-10 h-10 text-[#C9933A] animate-spin mx-auto mb-3" />
            <p className="font-sans text-sm text-[#6B4423]">Loading products...</p>
        </div>
    </div>
);

export default function ProductsPage() {
    return (
        <ClientOnly fallback={<Fallback />}>
            <Suspense fallback={<Fallback />}>
                <ProductsContent />
            </Suspense>
        </ClientOnly>
    );
}