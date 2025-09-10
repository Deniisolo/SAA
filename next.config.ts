import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel (producción completa con APIs)
  images: {
    domains: ['localhost', 'vercel.app', '*.vercel.app']
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

export default nextConfig;
