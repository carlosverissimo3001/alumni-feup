/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  ...(isProd && {
    basePath: '/newalumnieiworld',
    assetPrefix: '/newalumnieiworld/',
  }),
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI,
    LINKEDIN_STATE: process.env.LINKEDIN_STATE,
    LINKEDIN_SCOPE: process.env.LINKEDIN_SCOPE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_ESCO_BASE_URL: process.env.NEXT_PUBLIC_ESCO_BASE_URL,
  },
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
