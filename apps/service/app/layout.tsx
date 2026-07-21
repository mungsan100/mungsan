import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';

import '@/app/globals.css';

// Pretendard Variable self-host(8단계) — 가변 1파일로 전 굵기 커버, 외부 CDN 의존 없음.
const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: '뭉산 — 검증된 대표들의 B2B 협업 파트너 플랫폼',
  description:
    '데스밸리를 함께 넘는 컨소시엄. 검증된 초기 스타트업 대표·임원의 B2B 협업 파트너 플랫폼.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // scroll-smooth: 알림벨 → #decision-alerts 앵커 이동을 부드럽게(3단계).
    <html lang="ko" className={`h-full scroll-smooth ${pretendard.variable}`}>
      {/* 레이아웃 구조(모바일 프레임·탭바)는 (app) 그룹 레이아웃이 담당한다. */}
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
