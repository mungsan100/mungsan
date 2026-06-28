import type { NextConfig } from 'next';

// UI 레벨 목 단계 — DB/인프라 패키지 transpile·external 없음(스키마 미연결).
const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
