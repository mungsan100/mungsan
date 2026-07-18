import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import '@/app/globals.css';

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
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-slate-50">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
