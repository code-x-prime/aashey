import CategoriesContent from "./CategoriesContent";

export const metadata = {
    title: "Categories | Aashey - Pure A2 Cow Ghee Products",
    description: "Explore our collection of pure A2 Bilona Ghee. From traditional ghee to specialized variants, discover the health benefits of authentic A2 dairy.",
    alternates: {
        canonical: "/categories",
    },
    openGraph: {
        title: "Shop by Category | Aashey",
        description: "Browse our pure A2 Cow Ghee categories.",
        type: "website",
    },
};

export default function CategoriesPage() {
    return <CategoriesContent />;
}

