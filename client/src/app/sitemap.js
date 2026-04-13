import { API_URL } from "@/lib/utils";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aashey.com";

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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Dynamic Categories
  let categoryRoutes = [];
  try {
    const response = await fetch(`${API_URL}/public/categories`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await response.json();
    if (data.success && data.data?.categories) {
      categoryRoutes = data.data.categories.map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(cat.updatedAt || new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Failed to fetch categories", error);
  }

  // 3. Dynamic Products
  let productRoutes = [];
  try {
    // Fetch products with a high limit to get all slugs
    const response = await fetch(`${API_URL}/public/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    if (data.success && data.data?.products) {
      productRoutes = data.data.products.map((prod) => ({
        url: `${baseUrl}/products/${prod.slug}`,
        lastModified: new Date(prod.updatedAt || new Date()),
        changeFrequency: "daily",
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Failed to fetch products", error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
