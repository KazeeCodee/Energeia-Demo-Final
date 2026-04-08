import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true // Para demo estática
  },
  experimental: {
    optimizePackageImports: ['recharts', '@radix-ui/react-icons']
  },
  env: {
    NEXT_PUBLIC_APP_NAME: "Portal Informes Energeia",
    NEXT_PUBLIC_DEMO_MODE: "true",
    NEXT_PUBLIC_SIMULATION_DELAY: "1000"
  }
};

export default nextConfig;
