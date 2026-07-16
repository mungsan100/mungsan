import type { NextConfig } from 'next';

// @mungsan/db(워크스페이스 TS 패키지)는 transpile, Prisma·pg 네이티브 런타임은 서버 external.
const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ['@mungsan/db'],
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  // 파일 첨부(사업자등록증·소개서·공고 첨부)를 서버 액션으로 받는다 — 기본 1MB 한도로는
  // 문서 파일이 막히므로 상향. (프록시(nginx 등) 쪽 본문 한도는 배포 환경에서 별도 확인 필요)
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
