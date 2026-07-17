import type { NextConfig } from 'next';

// @mungsan/db(워크스페이스 TS 패키지)는 transpile, Prisma·pg 네이티브 런타임은 서버 external.
const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ['@mungsan/db'],
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  // 파일 첨부(사업자등록증·소개서·공고 첨부)를 서버 액션으로 받는다 — 기본 1MB 한도로는
  // 문서 파일이 막히므로 상향. 상한 25mb 근거: 기업정보 등록이 최대 10MB×2 + multipart
  // 오버헤드. 배포 프록시(somsatang.cloud)는 25MB 본문 통과를 실측 확인함(2026-07-17).
  experimental: { serverActions: { bodySizeLimit: '25mb' } },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
