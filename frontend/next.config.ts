import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    // Using a different prefix than /api to avoid conflicts with Vercel's default behavior
    const backendUrl = process.env.INTERNAL_API_URL || 'https://api.sparkbluediamond.com';
    return [
      {
        source: '/external-api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
