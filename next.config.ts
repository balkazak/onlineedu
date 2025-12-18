import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    domains: ['img.youtube.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },
  turbopack: {},  // Это пустая конфигурация для Turbopack
};

export default nextConfig;
