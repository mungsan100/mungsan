import { Suspense } from 'react';
import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import {
  getSupportIndustryNamesQuery,
  getSupportProgramsQuery,
} from './queries/support-programs.query';
import { SupportIndustryFilter } from './ui/support-industry-filter';
import { SupportProgramRow } from './ui/support-program-row';

// 지원사업 전체보기 — 홈 맞춤 지원사업 섹션의 확장 목록(마감 임박순 + 업종 칩 필터).
// 동적 데이터(searchParams·세션·DB)는 Suspense 안 섹션으로 분리(cacheComponents).
export default function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  return (
    <>
      <header className="bg-canvas px-5 pt-12 pb-4">
        <Link
          href="/"
          className="text-ink-500 hover:text-ink-900 -ml-1 inline-flex items-center gap-0.5 text-sm"
        >
          <LuChevronLeft className="h-4 w-4" />홈
        </Link>
        <h1 className="text-ink-900 mt-2 text-2xl font-bold">지원사업 공고</h1>
        <p className="text-ink-500 mt-1 text-sm">마감 임박순 · 내 회사와의 매칭률 표시</p>
      </header>

      <div className="space-y-4 px-5 pb-24">
        <Suspense fallback={<ListSkeleton />}>
          <SupportListSection searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function SupportListSection({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const { industry } = await searchParams;
  const selected = industry ?? null;
  const user = await getCurrentUser();
  const [programs, industryNames] = await Promise.all([
    getSupportProgramsQuery(user.id, selected ?? undefined),
    getSupportIndustryNamesQuery(),
  ]);

  return (
    <>
      <SupportIndustryFilter industryNames={industryNames} selected={selected} />

      {programs.length === 0 ? (
        <p className="text-ink-400 py-16 text-center text-sm">
          {selected ? `"${selected}" 업종 대상 공고가 없습니다.` : '등록된 공고가 없습니다.'}
        </p>
      ) : (
        <div className="space-y-3">
          {programs.map((program) => (
            <SupportProgramRow key={program.id} program={program} />
          ))}
        </div>
      )}
    </>
  );
}

const ListSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="bg-ink-100 h-28 animate-pulse rounded-2xl" />
    ))}
  </div>
);
