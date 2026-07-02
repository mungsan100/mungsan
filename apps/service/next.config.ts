import type { NextConfig } from 'next';

// @mungsan/db(워크스페이스 TS 패키지)는 transpile, Prisma·pg 네이티브 런타임은 서버 external.
const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ['@mungsan/db'],
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
