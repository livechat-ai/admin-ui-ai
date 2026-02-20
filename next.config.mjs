/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        const backendUrl = process.env.BACKEND_URL || "http://livechat-be:3310";
        return [
            {
                source: "/api/:path*",
                destination: `${backendUrl}/api/:path*`, // Proxy to backend service
            },
        ];
    },
};

export default nextConfig;
