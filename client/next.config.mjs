/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        qualities: [75, 85, 90, 95],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.r2.dev",
            },
            {
                protocol: "https",
                hostname: "**.digitaloceanspaces.com",
            },
            {
                protocol: "https",
                hostname: "**.cloudflare.com",
            }
        ]
    }
};

export default nextConfig;
