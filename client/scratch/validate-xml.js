
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aashey.com</loc>
    <lastmod>2026-05-10T06:33:35.708Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

// Simple XML validation
try {
    if (!sitemap.includes('<?xml') || !sitemap.includes('<urlset') || !sitemap.includes('</urlset>')) {
        throw new Error("Missing basic XML structure");
    }
    console.log("Basic XML structure is valid.");
} catch (e) {
    console.error("Invalid XML:", e.message);
}
