
const API_URL = "https://api.aashey.com/api";
const SITE_URL = "https://aashey.com";

async function generateSitemap() {
    try {
        console.log("Fetching categories...");
        const catRes = await fetch(`${API_URL}/public/categories`);
        const catData = await catRes.json();
        const categories = catData.success ? catData.data.categories : [];

        console.log("Fetching products...");
        const prodRes = await fetch(`${API_URL}/public/products?limit=1000`);
        const prodData = await prodRes.json();
        const products = prodData.success ? prodData.data.products : [];

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
        ];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static routes
        for (const route of staticRoutes) {
            xml += `  <url>\n    <loc>${SITE_URL}${route}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
        }

        // Categories
        for (const cat of categories) {
            xml += `  <url>\n    <loc>${SITE_URL}/category/${cat.slug}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }

        // Products
        for (const prod of products) {
            xml += `  <url>\n    <loc>${SITE_URL}/products/${prod.slug}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }

        xml += '</urlset>';

        console.log("Sitemap generated successfully!");
        console.log(xml.substring(0, 500));
        
        // In a real scenario we'd write this to public/sitemap.xml
        // But since this is a script, we'll just output it.
    } catch (e) {
        console.error("Error generating sitemap:", e.message);
    }
}

generateSitemap();
