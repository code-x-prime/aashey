"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    AlertCircle,
    Search,
    LayoutGrid,
    List,
} from "lucide-react";
import { ClientOnly } from "@/components/client-only";
import { toast } from "sonner";

import { ProductCard, ProductListCard } from "@/components/products/ProductCard";
// import CategoriesCarousel from "@/components/sections/CategoriesCarousel";

// ProductCardSkeleton component
function ProductCardSkeleton() {
    return (
        <div className="bg-[#FDF6E3] overflow-hidden rounded-md animate-pulse border border-[#C9933A]/15 shadow-sm">
            <div className="h-56 w-full bg-gradient-to-br from-[#FDF6E3] to-[#F5E6B8]/30"></div>
            <div className="p-4">
                <div className="h-3 w-16 bg-[#C9933A]/20 rounded-md mx-auto mb-3"></div>
                <div className="h-4 w-full bg-[#FDF6E3] rounded mb-2"></div>
                <div className="h-4 w-3/4 mx-auto bg-[#FDF6E3] rounded mb-4"></div>
                <div className="h-6 w-20 bg-[#C9933A]/20 rounded-md mx-auto"></div>
            </div>
        </div>
    );
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Helper to decode "+" back to space from querystring
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

    // Determine which section should be open based on URL params
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

    // Initialize selected filters from URL params
    const [selectedColors, setSelectedColors] = useState(colorId ? [colorId] : []);
    const [selectedSizes, setSelectedSizes] = useState(sizeId ? [sizeId] : []);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);

    const [filters, setFilters] = useState({
        search: searchQuery,
        category: categorySlug,
        subcategory: subcategorySlug,
        productType: productType,
        color: colorId,
        size: sizeId,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sortParam,
        order: orderParam,
    });

    // Local controlled input state for the Search field
    const [searchInput, setSearchInput] = useState(searchQuery);

    useEffect(() => {
        setSearchInput(filters.search || "");
    }, [filters.search]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    // Sync filters from URL
    useEffect(() => {
        const newFiltersFromURL = {
            search: searchQuery,
            category: categorySlug,
            subcategory: subcategorySlug,
            productType: productType,
            color: colorId,
            size: sizeId,
            minPrice: minPrice,
            maxPrice: maxPrice,
            sort: sortParam,
            order: orderParam,
        };

        const isSame =
            filters.search === newFiltersFromURL.search &&
            filters.category === newFiltersFromURL.category &&
            filters.subcategory === newFiltersFromURL.subcategory &&
            filters.productType === newFiltersFromURL.productType &&
            filters.color === newFiltersFromURL.color &&
            filters.size === newFiltersFromURL.size &&
            String(filters.minPrice || "") === String(newFiltersFromURL.minPrice || "") &&
            String(filters.maxPrice || "") === String(newFiltersFromURL.maxPrice || "") &&
            filters.sort === newFiltersFromURL.sort &&
            filters.order === newFiltersFromURL.order;

        if (!isSame) {
            setFilters(newFiltersFromURL);
            setSelectedColors(colorId ? [colorId] : []);
            setSelectedSizes(sizeId ? [sizeId] : []);
            setPagination((prev) => ({ ...prev, page: 1 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, categorySlug, subcategorySlug, productType, colorId, sizeId, minPrice, maxPrice, sortParam, orderParam]);

    const toggleFilterSection = (section) => {
        setActiveFilterSection(activeFilterSection === section ? "" : section);
    };

    // Function to update URL with current filters
    const updateURL = (newFilters) => {
        const pairs = [];
        const add = (k, v) => {
            if (v !== undefined && v !== null && v !== "") {
                const key = encodeURIComponent(k);
                const val = encodeURIComponent(String(v)).replace(/%20/g, "+");
                pairs.push(`${key}=${val}`);
            }
        };

        add("search", newFilters.search);
        add("category", newFilters.category);
        add("subcategory", newFilters.subcategory);
        add("productType", newFilters.productType);
        add("color", newFilters.color);
        add("size", newFilters.size);
        add("minPrice", newFilters.minPrice);
        add("maxPrice", newFilters.maxPrice);
        if (newFilters.sort !== "createdAt" || newFilters.order !== "desc") {
            add("sort", newFilters.sort);
            add("order", newFilters.order);
        }

        const qs = pairs.join("&");
        const newURL = qs ? `?${qs}` : window.location.pathname;
        router.push(newURL, { scroll: false });
    };

    // Fetch products based on filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let response;

                if (filters.productType) {
                    const queryParams = new URLSearchParams();
                    queryParams.append("limit", String(pagination.limit * pagination.page));

                    response = await fetchApi(`/public/products/type/${filters.productType}?${queryParams.toString()}`);

                    const allProducts = response.data?.products || [];
                    const startIndex = (pagination.page - 1) * pagination.limit;
                    const endIndex = startIndex + pagination.limit;
                    const paginatedProducts = allProducts.slice(startIndex, endIndex);

                    setProducts(paginatedProducts);
                    setPagination({
                        page: pagination.page,
                        limit: pagination.limit,
                        total: allProducts.length,
                        pages: Math.ceil(allProducts.length / pagination.limit),
                    });
                } else {
                    const queryParams = new URLSearchParams();
                    queryParams.append("page", String(pagination.page));
                    queryParams.append("limit", String(pagination.limit));

                    const validSortFields = ["createdAt", "updatedAt", "name", "featured"];
                    let sortField = filters.sort;
                    if (!validSortFields.includes(sortField)) {
                        sortField = "createdAt";
                    }

                    queryParams.append("sort", sortField);
                    queryParams.append("order", filters.order);

                    if (filters.search) queryParams.append("search", filters.search);
                    if (filters.category) queryParams.append("category", filters.category);
                    if (filters.subcategory) queryParams.append("subcategory", filters.subcategory);
                    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
                    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

                    // Collect all selected attribute value IDs
                    const allSelectedAttributeValueIds = new Set();

                    if (selectedColors.length > 0) {
                        queryParams.append("color", selectedColors[0]);
                        selectedColors.forEach((id) => allSelectedAttributeValueIds.add(id));
                    }

                    if (selectedSizes.length > 0) {
                        queryParams.append("size", selectedSizes[0]);
                        selectedSizes.forEach((id) => allSelectedAttributeValueIds.add(id));
                    }

                    Object.keys(selectedAttributes).forEach((attrKey) => {
                        if (attrKey !== "color" && attrKey !== "size") {
                            const selectedValues = selectedAttributes[attrKey] || [];
                            if (selectedValues.length > 0) {
                                selectedValues.forEach((id) => allSelectedAttributeValueIds.add(id));
                            }
                        }
                    });

                    if (allSelectedAttributeValueIds.size > 0) {
                        queryParams.append("attributeValueIds", Array.from(allSelectedAttributeValueIds).join(","));
                    }

                    response = await fetchApi(`/public/products?${queryParams.toString()}`);

                    const filteredProducts = response.data.products || [];
                    setProducts(filteredProducts);
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
                const [categoriesRes, filterAttrsRes] = await Promise.all([
                    fetchApi("/public/categories"),
                    fetchApi("/public/filter-attributes"),
                ]);

                setCategories(categoriesRes.data.categories || []);
                setColors(filterAttrsRes.data.colors || []);
                setSizes(filterAttrsRes.data.sizes || []);

                if (filterAttrsRes.data.attributes && Array.isArray(filterAttrsRes.data.attributes)) {
                    setAllAttributes(filterAttrsRes.data.attributes);
                } else {
                    const attrs = [];
                    if (filterAttrsRes.data.colors && filterAttrsRes.data.colors.length > 0) {
                        attrs.push({ id: "color-attr", name: "Color", inputType: "select", values: filterAttrsRes.data.colors });
                    }
                    if (filterAttrsRes.data.sizes && filterAttrsRes.data.sizes.length > 0) {
                        attrs.push({ id: "size-attr", name: "Size", inputType: "select", values: filterAttrsRes.data.sizes });
                    }
                    setAllAttributes(attrs);
                }
            } catch (err) {
                console.error("Error fetching filter options:", err);
            }
        };

        fetchFilterOptions();
    }, []);

    // Fetch max price
    useEffect(() => {
        const fetchMaxPrice = async () => {
            try {
                const response = await fetchApi("/public/products/max-price");
                const maxPrice = response.data.maxPrice || 1000;
                setMaxPossiblePrice(Math.ceil(maxPrice / 100) * 100);
            } catch (err) {
                console.error("Error fetching max price:", err);
                setMaxPossiblePrice(1000);
            }
        };

        fetchMaxPrice();
    }, []);

    // Error notification
    useEffect(() => {
        if (error) {
            toast.error(`Error loading products. Please try again.`);
        }
    }, [error]);

    // Scroll on page change
    useEffect(() => {
        let raf1 = 0;
        let raf2 = 0;
        let timeoutId = 0;

        const doScroll = () => {
            const mainContent = document.getElementById("products-main");
            if (mainContent) {
                mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        };

        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                timeoutId = window.setTimeout(doScroll, 80);
            });
        });

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
            clearTimeout(timeoutId);
        };
    }, [pagination.page]);

    const handleFilterChange = (name, value) => {
        if ((name === "minPrice" || name === "maxPrice") && value !== "") {
            const numValue = Number.parseFloat(value);
            if (isNaN(numValue)) return;
            value = numValue.toString();
        }
        const newFilters = { ...filters, [name]: value };
        if (name === "category") newFilters.subcategory = "";
        setFilters(newFilters);
        updateURL(newFilters);

        if (pagination.page !== 1) {
            setPagination((prev) => ({ ...prev, page: 1 }));
        }

        if (mobileFiltersOpen && window.innerWidth < 768 && name !== "minPrice" && name !== "maxPrice" && name !== "search") {
            setMobileFiltersOpen(false);
        }

        switch (name) {
            case "search":
                if (value) setActiveFilterSection("search");
                break;
            case "category":
                if (value) setActiveFilterSection("categories");
                if (name === "category") setFilters((prev) => ({ ...prev, subcategory: "" }));
                break;
            case "subcategory":
                if (value) setActiveFilterSection("categories");
                break;
            case "color":
                if (value) setActiveFilterSection("colors");
                break;
            case "size":
                if (value) setActiveFilterSection("sizes");
                break;
            default:
                if (allAttributes.some((attr) => attr.name.toLowerCase() === name.toLowerCase())) {
                    const sectionKey = `${name.toLowerCase()}s`;
                    if (value) setActiveFilterSection(sectionKey);
                }
                break;
        }
    };

    const handleAttributeValueChange = (attributeName, attributeValueId) => {
        const attrKey = attributeName.toLowerCase();
        const currentSelected = selectedAttributes[attrKey] || [];
        const isAlreadySelected = currentSelected.includes(attributeValueId);

        let updatedSelected = [];
        if (isAlreadySelected) {
            updatedSelected = currentSelected.filter((id) => id !== attributeValueId);
        } else {
            updatedSelected = [attributeValueId];
        }

        setSelectedAttributes((prev) => ({ ...prev, [attrKey]: updatedSelected }));

        if (attrKey === "color") {
            setSelectedColors(updatedSelected);
            handleFilterChange("color", updatedSelected.length > 0 ? updatedSelected[0] : "");
        } else if (attrKey === "size") {
            setSelectedSizes(updatedSelected);
            handleFilterChange("size", updatedSelected.length > 0 ? updatedSelected[0] : "");
        }
    };

    const handleColorChange = (colorId) => {
        handleAttributeValueChange("Color", colorId);
    };

    const handleSizeChange = (sizeId) => {
        handleAttributeValueChange("Size", sizeId);
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: "",
            category: "",
            subcategory: "",
            productType: "",
            color: "",
            size: "",
            minPrice: "",
            maxPrice: "",
            sort: "createdAt",
            order: "desc",
        };
        setFilters(clearedFilters);
        setSelectedColors([]);
        setSelectedSizes([]);
        setSelectedAttributes({});
        updateURL(clearedFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
        setActiveFilterSection("search");
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        let newSort = filters.sort;
        let newOrder = filters.order;

        switch (value) {
            case "newest":
                newSort = "createdAt";
                newOrder = "desc";
                break;
            case "oldest":
                newSort = "createdAt";
                newOrder = "asc";
                break;
            case "price-low":
                newSort = "createdAt";
                newOrder = "asc";
                break;
            case "price-high":
                newSort = "createdAt";
                newOrder = "desc";
                break;
            case "name-asc":
                newSort = "name";
                newOrder = "asc";
                break;
            case "name-desc":
                newSort = "name";
                newOrder = "desc";
                break;
        }

        const newFilters = { ...filters, sort: newSort, order: newOrder };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPagination((prev) => ({ ...prev, page: newPage }));
        scrollToTop();
    };

    // Loading state
    if (loading && products.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
                <div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-[#6B4423]">Loading products...</p>
            </div>
        );
    }

    return (
        <>
            <div id="products-main">
                <div>
                    {/* Hero Banner */}
                    <div className="relative w-full h-[180px] md:h-[280px] mb-6 md:mb-10 rounded-lg overflow-hidden shadow-lg border border-[#C9933A]/20">
                        <Image src="/banner-background.jpg" alt="Premium A2 Ghee" fill className="object-cover object-top" priority />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#3F1F00]/95 via-[#3F1F00]/70 to-transparent">
                            <div className="h-full flex flex-col justify-center px-6 md:px-12 max-w-2xl">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C9933A]/20 backdrop-blur-sm border border-[#C9933A]/40 rounded-md text-[#C9933A] text-xs md:text-sm font-medium w-fit mb-3 md:mb-4">
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    100% Pure A2 Ghee
                                </span>
                                <h1 className="text-2xl md:text-5xl font-bold font-cormorant text-[#FDF6E3] mb-2 md:mb-3">All Products</h1>
                                <p className="text-sm md:text-lg text-[#FDF6E3]/80 leading-relaxed">Discover our collection of pure A2 ghee, handcrafted using the traditional Bilona method.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile filter toggle */}
                    <div className="md:hidden flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Products</h2>
                        <Button variant="outline" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        {/* Filters Sidebar */}
                        <div className={`md:w-1/4 lg:w-1/5 ${mobileFiltersOpen ? "block fixed inset-0 z-50 bg-[#FDF6E3] p-4 overflow-auto" : "hidden"} md:block md:static md:z-auto md:bg-transparent md:p-0`}>
                            <div className="bg-white rounded-lg shadow-sm border border-[#C9933A]/20 sticky top-32">
                                <div className="flex items-center justify-between p-4 border-b border-[#C9933A]/20">
                                    <h2 className="text-base font-bold font-cormorant text-[#3F1F00]">Filters</h2>
                                    <div className="flex items-center gap-3">
                                        <button onClick={clearFilters} className="text-xs text-[#C9933A] font-medium hover:underline">Clear all</button>
                                        <button className="md:hidden p-1.5 text-[#3F1F00] hover:bg-[#C9933A]/10 rounded-md" onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" /></button>
                                    </div>
                                </div>

                                {/* Search Filter */}
                                <div className="p-4 border-b border-[#C9933A]/20">
                                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleFilterSection("search")}>
                                        <h3 className="text-sm font-medium uppercase text-[#3F1F00]">Search</h3>
                                        {activeFilterSection === "search" ? <ChevronUp className="h-4 w-4 text-[#C9933A]" /> : <ChevronDown className="h-4 w-4 text-[#C9933A]" />}
                                    </div>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFilterSection === "search" ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                        <form onSubmit={(e) => { e.preventDefault(); handleFilterChange("search", searchInput); }} className="relative">
                                            <Input name="search" placeholder="Search ghee..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full pr-10 border-[#C9933A]/40 focus:border-[#C9933A] rounded-lg" />
                                            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2"><Search className="h-4 w-4 text-[#C9933A]" /></button>
                                        </form>
                                    </div>
                                </div>

                                {/* Categories Filter */}
                                <div className="p-4 border-b border-[#C9933A]/20">
                                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleFilterSection("categories")}>
                                        <h3 className="text-sm font-medium uppercase text-[#3F1F00]">Categories</h3>
                                        {activeFilterSection === "categories" ? <ChevronUp className="h-4 w-4 text-[#C9933A]" /> : <ChevronDown className="h-4 w-4 text-[#C9933A]" />}
                                    </div>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFilterSection === "categories" ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {categories.map((category) => (
                                                <div key={category.id} className="ml-2">
                                                    <div className={`cursor-pointer hover:text-[#C9933A] flex items-center transition-colors ${filters.category === category.slug && !filters.subcategory ? "font-medium text-[#C9933A]" : "text-[#3F1F00]"}`} onClick={() => handleFilterChange("category", category.slug)}>
                                                        <ChevronRight className="h-4 w-4 mr-1" />
                                                        {category.name}
                                                    </div>
                                                    {category.subCategories && category.subCategories.length > 0 && (
                                                        <div className="ml-4 mt-1 space-y-1">
                                                            {category.subCategories.map((sub) => (
                                                                <div key={sub.id} className={`cursor-pointer hover:text-[#C9933A] text-sm transition-colors ${filters.subcategory === sub.slug ? "font-medium text-[#C9933A]" : "text-[#3F1F00]/70"}`} onClick={() => { const next = { ...filters, category: category.slug, subcategory: sub.slug }; setFilters(next); updateURL(next); setPagination((prev) => ({ ...prev, page: 1 })); }}>
                                                                    {sub.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Attributes Filters */}
                                {allAttributes.map((attribute, attrIndex) => {
                                    const attrKey = attribute.name.toLowerCase();
                                    const isLast = attrIndex === allAttributes.length - 1;
                                    const sectionKey = `${attrKey}s`;
                                    const isOpen = activeFilterSection === sectionKey;
                                    const selectedValues = selectedAttributes[attrKey] || [];

                                    if (attrKey === "color") {
                                        const displaySelectedValues = selectedColors;
                                        return (
                                            <div key={attribute.id} className={`p-4 ${isLast ? "" : "border-b"}`}>
                                                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleFilterSection(sectionKey)}>
                                                    <h3 className="text-sm font-medium uppercase">{attribute.name}</h3>
                                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {attribute.values.map((value) => (
                                                            <div key={value.id} className={`cursor-pointer hover:text-[#C9933A] ml-2 flex items-center ${displaySelectedValues.includes(value.id) ? "font-medium text-[#C9933A]" : ""}`} onClick={() => handleColorChange(value.id)}>
                                                                <div className="w-4 h-4 border border-[#C9933A]/25 rounded mr-2 flex items-center justify-center">
                                                                    {displaySelectedValues.includes(value.id) && <div className="w-2 h-2 rounded-sm bg-[#C9933A]"></div>}
                                                                </div>
                                                                {value.hexCode && <div className="w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: value.hexCode }} />}
                                                                {value.image && <div className="w-4 h-4 rounded-full overflow-hidden mr-2"><Image src={value.image || "/placeholder.svg"} alt={value.name} width={16} height={16} /></div>}
                                                                {value.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (attrKey === "size") {
                                        const displaySelectedValues = selectedSizes;
                                        return (
                                            <div key={attribute.id} className={`p-4 ${isLast ? "" : "border-b"}`}>
                                                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleFilterSection(sectionKey)}>
                                                    <h3 className="text-sm font-medium uppercase">{attribute.name}</h3>
                                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {attribute.values.map((value) => (
                                                            <div key={value.id} className={`cursor-pointer hover:text-[#C9933A] ml-2 flex items-center ${displaySelectedValues.includes(value.id) ? "font-medium text-[#C9933A]" : ""}`} onClick={() => handleSizeChange(value.id)}>
                                                                <div className="w-4 h-4 border border-[#C9933A]/25 rounded mr-2 flex items-center justify-center">
                                                                    {displaySelectedValues.includes(value.id) && <div className="w-2 h-2 rounded-sm bg-[#C9933A]"></div>}
                                                                </div>
                                                                {value.display || value.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={attribute.id} className={`p-4 ${isLast ? "" : "border-b"}`}>
                                            <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleFilterSection(sectionKey)}>
                                                <h3 className="text-sm font-medium uppercase">{attribute.name}</h3>
                                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </div>
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {attribute.values.map((value) => (
                                                        <div key={value.id} className={`cursor-pointer hover:text-[#C9933A] ml-2 flex items-center ${selectedValues.includes(value.id) ? "font-medium text-[#C9933A]" : ""}`} onClick={() => handleAttributeValueChange(attribute.name, value.id)}>
                                                            <div className="w-4 h-4 border border-[#C9933A]/25 rounded mr-2 flex items-center justify-center">
                                                                {selectedValues.includes(value.id) && <div className="w-2 h-2 rounded-sm bg-[#C9933A]"></div>}
                                                            </div>
                                                            {value.hexCode && <div className="w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: value.hexCode }} />}
                                                            {value.image && <div className="w-4 h-4 rounded-full overflow-hidden mr-2"><Image src={value.image || "/placeholder.svg"} alt={value.name} width={16} height={16} /></div>}
                                                            {value.display || value.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="md:w-3/4 lg:w-4/5">
                            {/* Product count and sort */}
                            <div className="flex justify-between md:justify-end mb-6 items-center flex-col md:flex-row gap-4">
                                <div className="text-sm text-[#5C3A1E]">
                                    {loading && !products.length ? (
                                        <div className="h-4 w-24 bg-[#C9933A]/15 rounded animate-pulse"></div>
                                    ) : (
                                        <>Showing <span className="font-semibold">{products.length}</span> of <span className="font-semibold">{pagination.total || 0}</span> products</>
                                    )}
                                </div>

                                {loading && (
                                    <div className="text-sm text-[#6B4423] flex items-center">
                                        <div className="w-4 h-4 border-2 border-[primary] border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Updating...
                                    </div>
                                )}

                                {/* View Toggle */}
                                <div className="flex items-center bg-[#FDF6E3] rounded-md p-0.5 border border-[#C9933A]/15">
                                    <button
                                        onClick={() => handleViewChange("grid")}
                                        title="Grid view"
                                        className={`p-1.5 rounded transition-all duration-200 ${viewMode === "grid" ? "bg-[#3F1F00] text-[#FDF6E3] shadow-sm" : "text-[#7A4E2D] hover:text-[#3F1F00]"}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleViewChange("list")}
                                        title="List view"
                                        className={`p-1.5 rounded transition-all duration-200 ${viewMode === "list" ? "bg-[#3F1F00] text-[#FDF6E3] shadow-sm" : "text-[#7A4E2D] hover:text-[#3F1F00]"}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="inline-flex items-center border rounded-md overflow-hidden bg-white w-full md:w-auto">
                                    <span className="px-3 py-2 text-sm bg-[#FDF6E3]">SORT BY</span>
                                    <select id="sort" name="sort" className="border-l px-3 py-2 focus:outline-none w-full md:w-auto" onChange={handleSortChange} disabled={loading}
                                        value={filters.sort === "createdAt" && filters.order === "desc" ? "newest" : filters.sort === "createdAt" && filters.order === "asc" ? "oldest" : filters.sort === "name" && filters.order === "asc" ? "name-asc" : filters.sort === "name" && filters.order === "desc" ? "name-desc" : "newest"}>
                                        <option value="newest">Featured</option>
                                        <option value="price-low">Price, low to high</option>
                                        <option value="price-high">Price, high to low</option>
                                        <option value="name-asc">Alphabetically, A-Z</option>
                                        <option value="name-desc">Alphabetically, Z-A</option>
                                        <option value="oldest">Date, old to new</option>
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(filters.search || filters.category || filters.subcategory || selectedColors.length > 0 || selectedSizes.length > 0 || filters.minPrice || filters.maxPrice) && (
                                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-[#FDF6E3] rounded-md border">
                                    <span className="text-sm font-medium">Active Filters:</span>

                                    {filters.search && (
                                        <div className="bg-[#C9933A] text-black text-xs px-2 py-1 rounded-md flex items-center">
                                            <span>Search: {filters.search}</span>
                                            <button onClick={() => handleFilterChange("search", "")} className="ml-1"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}

                                    {filters.category && (
                                        <div className="bg-[#C9933A] text-[#3F1F00] text-xs px-2 py-1 rounded-md flex items-center">
                                            <span>Category: {categories.find((c) => c.slug === filters.category)?.name || filters.category}</span>
                                            <button onClick={() => { handleFilterChange("category", ""); handleFilterChange("subcategory", ""); }} className="ml-1"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}
                                    {filters.subcategory && (
                                        <div className="bg-[#C9933A] text-[#3F1F00] text-xs px-2 py-1 rounded-md flex items-center">
                                            <span>Subcategory: {(() => { const cat = categories.find((c) => c.slug === filters.category); const sub = cat?.subCategories?.find((s) => s.slug === filters.subcategory); return sub?.name || filters.subcategory; })()}</span>
                                            <button onClick={() => handleFilterChange("subcategory", "")} className="ml-1"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}

                                    {selectedColors.length > 0 && (
                                        <div className="bg-[#C9933A] text-white text-xs px-2 py-1 rounded-md flex items-center">
                                            <span>Color: {colors.find((c) => c.id === selectedColors[0])?.name || selectedColors[0]}</span>
                                            <button onClick={() => { setSelectedColors([]); handleFilterChange("color", ""); }} className="ml-1"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}

                                    {selectedSizes.length > 0 && (
                                        <div className="bg-[#C9933A] text-white text-xs px-2 py-1 rounded-md flex items-center">
                                            <span>Size: {sizes.find((s) => s.id === selectedSizes[0])?.display || sizes.find((s) => s.id === selectedSizes[0])?.name || selectedSizes[0]}</span>
                                            <button onClick={() => { setSelectedSizes([]); handleFilterChange("size", ""); }} className="ml-1"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}

                                    {(filters.minPrice || filters.maxPrice) && (
                                        <div className="bg-[#C9933A] text-white text-xs px-2 py-1 rounded-md flex items-center">
                                            <span>Price: {filters.minPrice || "0"} - {filters.maxPrice || "∞"}</span>
                                            <button onClick={() => { handleFilterChange("minPrice", ""); handleFilterChange("maxPrice", ""); }} className="ml-1"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}

                                    <button onClick={clearFilters} className="text-xs text-[#C9933A] underline ml-2">Clear All</button>
                                </div>
                            )}

                            {/* Products Grid / List */}
                            {loading && products.length === 0 ? (
                                viewMode === "grid" ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
                                        {[...Array(pagination.limit || 12)].map((_, i) => <ProductCardSkeleton key={i} />)}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="flex flex-row bg-white border border-[#C9933A]/15 rounded-lg overflow-hidden animate-pulse">
                                                <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-[#C9933A]/10" />
                                                <div className="flex-1 p-4 space-y-2">
                                                    <div className="h-3 bg-[#C9933A]/10 rounded w-1/4" />
                                                    <div className="h-4 bg-[#C9933A]/15 rounded w-3/4" />
                                                    <div className="h-5 bg-[#C9933A]/10 rounded w-1/3 mt-4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : products.length === 0 ? (
                                <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
                                    <div className="text-[#C9933A]/50 mb-4"><AlertCircle className="h-12 w-12 mx-auto" /></div>
                                    <h2 className="text-xl font-semibold mb-3">No products found</h2>
                                    {selectedColors.length > 0 && selectedSizes.length > 0 ? (
                                        <p className="text-[#5C3A1E] mb-6">No products match both the selected color and size. Try a different combination.</p>
                                    ) : selectedColors.length > 0 ? (
                                        <p className="text-[#5C3A1E] mb-6">No products available with this color. Try selecting a different color.</p>
                                    ) : selectedSizes.length > 0 ? (
                                        <p className="text-[#5C3A1E] mb-6">No products available with this size. Try selecting a different size.</p>
                                    ) : filters.minPrice || filters.maxPrice ? (
                                        <p className="text-[#5C3A1E] mb-6">No products match the selected price range. Try adjusting your price filter.</p>
                                    ) : (
                                        <p className="text-[#5C3A1E] mb-6">Try adjusting your filters or search term.</p>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Button onClick={clearFilters} className="bg-[#C9933A] hover:bg-[#B8842F] text-white">Clear All Filters</Button>
                                        {selectedColors.length > 0 && <Button variant="outline" onClick={() => { setSelectedColors([]); handleFilterChange("color", ""); }}>Clear Color Filter</Button>}
                                        {selectedSizes.length > 0 && <Button variant="outline" onClick={() => { setSelectedSizes([]); handleFilterChange("size", ""); }}>Clear Size Filter</Button>}
                                        {(filters.minPrice || filters.maxPrice) && <Button variant="outline" onClick={() => { handleFilterChange("minPrice", ""); handleFilterChange("maxPrice", ""); }}>Clear Price Filter</Button>}
                                    </div>
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
                                    {loading ? [...Array(pagination.limit || 12)].map((_, i) => <ProductCardSkeleton key={i} />) : products.map((product) => <ProductCard key={product.id} product={product} />)}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {loading ? [...Array(8)].map((_, i) => (
                                        <div key={i} className="flex flex-row bg-white border border-[#C9933A]/15 rounded-lg overflow-hidden animate-pulse">
                                            <div className="w-28 h-28 flex-shrink-0 bg-[#C9933A]/10" />
                                            <div className="flex-1 p-4 space-y-2">
                                                <div className="h-3 bg-[#C9933A]/10 rounded w-1/4" />
                                                <div className="h-4 bg-[#C9933A]/15 rounded w-3/4" />
                                                <div className="h-5 bg-[#C9933A]/10 rounded w-1/3 mt-4" />
                                            </div>
                                        </div>
                                    )) : products.map((product) => <ProductListCard key={product.id} product={product} />)}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center items-center mt-10 mb-4">
                                    <div className="inline-flex items-center rounded-md overflow-hidden border divide-x">
                                        <Button variant="ghost" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1 || loading} className="rounded-none border-0 hover:bg-[#FDF6E3] hover:text-black">
                                            <ChevronDown className="h-4 w-4 rotate-90" />
                                        </Button>

                                        {[...Array(pagination.pages)].map((_, i) => {
                                            const page = i + 1;
                                            if (page === 1 || page === pagination.pages || (page >= pagination.page - 1 && page <= pagination.page + 1)) {
                                                return (
                                                    <button key={page} onClick={() => handlePageChange(page)} disabled={loading} className={`px-3 py-2 text-sm ${pagination.page === page ? "bg-[#C9933A] text-white" : "hover:bg-[#FDF6E3]"}`}>
                                                        {page}
                                                    </button>
                                                );
                                            }

                                            if ((page === 2 && pagination.page > 3) || (page === pagination.pages - 1 && pagination.page < pagination.pages - 2)) {
                                                return (<span key={page} className="px-3 py-2">...</span>);
                                            }

                                            return null;
                                        })}

                                        <Button variant="ghost" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages || loading} className="rounded-none border-0 hover:bg-[#FDF6E3] hover:text-black">
                                            <ChevronUp className="h-4 w-4 rotate-90" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ProductsPage() {
    return (
        <div className="min-h-screen bg-[#FDF6E3]">
            <div className="container mx-auto px-4 py-6">
                <ClientOnly fallback={<div className="flex flex-col justify-center items-center h-64 gap-3"><div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin"></div><p className="text-sm text-[#5C3A1E]">Loading...</p></div>}>
                    <Suspense fallback={<div className="flex flex-col justify-center items-center h-64 gap-3"><div className="w-12 h-12 border-4 border-[#C9933A] border-t-transparent rounded-full animate-spin"></div><p className="text-sm text-[#5C3A1E]">Loading...</p></div>}>
                        <ProductsContent />
                    </Suspense>
                </ClientOnly>
            </div>
        </div>
    );
}
