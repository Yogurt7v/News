import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'be-informed.ru',
        pathname: '/api/files/**',
      },
    ],
  },
  reactCompiler: false,

  serverExternalPackages: ['@mtcute/node', '@mtcute/wasm'],

  //  если будут проблемы с CORS или путями
  experimental: {
    serverComponentsExternalPackages: ['@mtcute/node', '@mtcute/wasm'],
    serverActions: {
      allowedOrigins: ['be-informed.ru'],
    },
  },
};

export default nextConfig;
