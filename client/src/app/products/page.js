import { Suspense } from "react";
import { ClientOnly } from "@/components/client-only";
import { RiLoader4Line } from "react-icons/ri";
import ProductsListingContent from "./ProductsListingContent";

export const metadata = {
    title: "All Products | Aashey - Pure A2 Bilona Ghee Collection",
    description: "Browse our complete collection of pure A2 Cow Ghee, traditionally crafted using the Bilona method. Lab tested, no preservatives, and 100% authentic.",
    alternates: {
        canonical: "/products",
    },
    openGraph: {
        title: "Shop All Products | Aashey",
        description: "Experience the purity of AASHEY A2 Cow Ghee.",
        type: "website",
    },
};

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
                <ProductsListingContent />
            </Suspense>
        </ClientOnly>
    );
}