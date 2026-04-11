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
  allowedDevOrigins: [
    'be-informed.ru',
    'news-yogurt7vs-projects.vercel.app',
  ],

  //  если будут проблемы с CORS или путями
  experimental: {
    serverComponentsExternalPackages: ['@mtcute/node', '@mtcute/wasm'],
    serverActions: {
      allowedOrigins: ['*'], // опасно!
    },
  },
};

export default nextConfig;
