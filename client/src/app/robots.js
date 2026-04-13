export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aashey.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth/",
        "/account/",
        "/checkout/",
        "/wishlist/",
        "/forgot-password/",
        "/reset-password/",
        "/verify-otp/",
        "/api/", // Though usually proxied, good to have
        "/admin/", // If it exists on the same domain
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
