import type { Metadata } from 'next';

import '@/app/globals.css';

export const metadata: Metadata = {
  title: '뭉산 — 더 큰 협업을 위한 기회',
  description:
    '초기 스타트업을 위한 협업 파트너 플랫폼. 혼자서는 어려운 프로젝트를 함께 수행할 파트너사를 찾으세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
