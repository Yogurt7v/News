import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: '5.53.125.238',
        port: '8090',
        pathname: '/api/files/**',
      },
    ],
  },
  /* config options here */
  reactCompiler: true,

  serverExternalPackages: [
    '@mtcute/node',
    '@mtcute/wasm',
    // '@mtcute/crypto-node',
  ],
};

export default nextConfig;
