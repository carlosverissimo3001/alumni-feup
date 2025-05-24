import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/newalumnieiworld',
  ...(isProd && {
    assetPrefix: '/newalumnieiworld/',
  }),
};

export default nextConfig;
