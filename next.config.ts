import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  serverExternalPackages: [
    '@mtcute/node',
    '@mtcute/wasm',
    // '@mtcute/crypto-node',
  ],
};

export default nextConfig;
