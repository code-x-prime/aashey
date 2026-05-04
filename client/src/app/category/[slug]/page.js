import { fetchApi } from "@/lib/utils";
import CategoryContent from "./CategoryContent";
import { getImageUrl } from "@/lib/imageUrl";

export async function generateMetadata({ params }) {
    const { slug } = params;
    let title = "Category | Aashey";
    let description = "Explore our range of premium A2 Bilona Ghee products by category. Pure, traditional, and healthy.";
    let image = null;

    try {
        const response = await fetchApi(`/public/categories/${slug}/products?limit=1`);
        const category = response.data.category;

        if (category) {
            title = `${category.name} | Aashey - Pure A2 Cow Ghee`;
            description = category.description || `Buy pure and authentic ${category.name} from Aashey. Hand-churned using traditional Bilona method.`;
            
            if (category.image) {
                image = getImageUrl(category.image);
            }
        }
    } catch (error) {
        console.error("Error fetching category metadata:", error);
    }

    return {
        title,
        description,
        alternates: {
            canonical: `/category/${slug}`,
        },
        openGraph: {
            title,
            description,
            images: image ? [{ url: image }] : [],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : [],
        },
    };
}

export default function CategoryPage({ params }) {
    return <CategoryContent slug={params.slug} />;
}
