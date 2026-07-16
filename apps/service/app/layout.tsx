import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import '@/app/globals.css';

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
    <html lang="ko" className="h-full">
      {/* 레이아웃 구조(모바일 프레임·탭바)는 (app) 그룹 레이아웃이 담당한다. */}
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
