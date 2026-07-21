import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';

import '@/app/globals.css';

// Pretendard Variable self-host(8단계) — service 와 동일 파일·설정.
const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: '뭉산 운영 백오피스',
  description: '뭉산 서비스 운영을 위한 어드민 백오피스.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full ${pretendard.variable}`}>
      <body className="min-h-full bg-slate-50">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
