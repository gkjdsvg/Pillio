import type { NextConfig } from "next";

const nextConfig= {
  /* config options here */
    async rewrites() {
        return [
            {
                source: "/search",
                destination: 'http://localhost:8080/:path*',
            },
        ]
    },
};

module.exports = nextConfig
