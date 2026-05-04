export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aashey.com";

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
        "/api/",
        "/admin/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
