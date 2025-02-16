/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "storage.cdn-luma.com",
          },
        ],
    },
};

export default nextConfig;
