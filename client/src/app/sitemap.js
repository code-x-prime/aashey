import { API_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aashey.com";

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/faqs",
    "/why-us",
    "/return-policy",
    "/shipping-policy",
    "/warranty",
    "/categories",
    "/products",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  let categoryRoutes = [];
  let productRoutes = [];

  try {
    console.log("Sitemap: Fetching categories from", `${API_URL}/public/categories`);
    const response = await fetch(`${API_URL}/public/categories`, {
      next: { revalidate: 0 },
    });
    const data = await response.json();
    if (data.success && data.data?.categories) {
      categoryRoutes = data.data.categories.map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap category fetch error:", error.message);
  }

  try {
    console.log("Sitemap: Fetching products from", `${API_URL}/public/products?limit=1000`);
    const response = await fetch(`${API_URL}/public/products?limit=1000`, {
      next: { revalidate: 0 },
    });
    const data = await response.json();
    if (data.success && data.data?.products) {
      productRoutes = data.data.products.map((prod) => ({
        url: `${baseUrl}/products/${prod.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error("Sitemap product fetch error:", error.message);
  }

  // Return all routes
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
