import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel (producción completa con APIs)
  images: {
    domains: ['localhost', 'vercel.app']
  }
};

export default nextConfig;
