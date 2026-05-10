// app/sitemap.js
export const revalidate = 21600;

export default async function sitemap() {
  const baseUrl = "https://aashey.com";

  const staticRoutes = [
    "", "/about", "/contact", "/faqs", "/why-us",
    "/return-policy", "/shipping-policy", "/warranty",
    "/categories", "/products",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  let categoryRoutes = [];
  let productRoutes = [];

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000); // 4 sec hard timeout

    const res = await fetch(`https://api.aashey.com/api/public/categories`, {
      signal: controller.signal,
    });
    const data = await res.json();
    if (data.success && data.data?.categories) {
      categoryRoutes = data.data.categories.map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (e) {
    console.error("Sitemap categories failed:", e.message);
  }

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.aashey.com/api/public/products?limit=1000`, {
      signal: controller.signal,
    });
    const data = await res.json();
    if (data.success && data.data?.products) {
      productRoutes = data.data.products.map((prod) => ({
        url: `${baseUrl}/products/${prod.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      }));
    }
  } catch (e) {
    console.error("Sitemap products failed:", e.message);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}