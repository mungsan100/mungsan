import { Suspense } from 'react';
import Link from 'next/link';

import { getInquiriesQuery } from './queries/inquiries.query';
import { InquiryRow } from './ui/inquiry-row';

// 문의 관리(2026-07-20, 3-1) — 회원 문의를 대기/처리 완료 탭으로 확인·처리한다.
export default function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">문의 관리</h1>
      <Suspense fallback={<ListSkeleton />}>
        <InquiriesSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function InquiriesSection({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const mode = tab === 'done' ? 'resolved' : 'pending';
  const inquiries = await getInquiriesQuery(mode);

  return (
    <div className="space-y-4">
      <nav className="flex gap-2">
        <TabLink href="/inquiries" active={mode === 'pending'}>
          대기
        </TabLink>
        <TabLink href="/inquiries?tab=done" active={mode === 'resolved'}>
          처리 완료
        </TabLink>
      </nav>

      {inquiries.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
          {mode === 'pending' ? '대기 중인 문의가 없습니다.' : '처리된 문의가 없습니다.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((inquiry) => (
            <InquiryRow key={inquiry.id} inquiry={inquiry} />
          ))}
        </ul>
      )}
    </div>
  );
}

const TabLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
      active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </Link>
);

const ListSkeleton = () => (
  <div className="space-y-3">
    <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />
    <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
  </div>
);
