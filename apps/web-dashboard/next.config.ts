import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@devlock/ui', '@devlock/shared-types'],
  output: 'standalone',
  experimental: {
    typedRoutes: true,
  },
};

export default config;
