/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://livechat-be:3310/api/:path*", // Proxy to backend service
            },
        ];
    },
};

export default nextConfig;
