import { Suspense } from 'react';
import Link from 'next/link';
import { LuChevronDown, LuChevronLeft } from 'react-icons/lu';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import {
  getSupportIndustryNamesQuery,
  getSupportProgramsQuery,
  SUPPORT_PAGE_SIZE,
} from './queries/support-programs.query';
import { SupportIndustryFilter } from './ui/support-industry-filter';
import { SupportProgramRow } from './ui/support-program-row';

// 지원사업 전체보기 — 홈 맞춤 지원사업 섹션의 확장 목록(마감 임박순 + 업종 칩 필터).
// 동적 데이터(searchParams·세션·DB)는 Suspense 안 섹션으로 분리(cacheComponents).
export default function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; show?: string }>;
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

// ?show= 은 "더 보기"를 누른 만큼 늘어나는 노출 상한 — 최소 1페이지, 폭주 입력만 캡.
const MAX_SHOW = 2000;
function parseShow(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(parsed)) return SUPPORT_PAGE_SIZE;
  return Math.min(Math.max(parsed, SUPPORT_PAGE_SIZE), MAX_SHOW);
}

async function SupportListSection({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; show?: string }>;
}) {
  const { industry, show } = await searchParams;
  const selected = industry ?? null;
  const shown = parseShow(show);
  const user = await getCurrentUser();
  const [{ programs, totalCount }, industryNames] = await Promise.all([
    getSupportProgramsQuery(user.id, selected ?? undefined, shown),
    getSupportIndustryNamesQuery(),
  ]);

  const remaining = totalCount - programs.length;
  const moreParams = new URLSearchParams({
    ...(selected ? { industry: selected } : {}),
    show: String(shown + SUPPORT_PAGE_SIZE),
  });

  return (
    <>
      <SupportIndustryFilter industryNames={industryNames} selected={selected} />

      {programs.length === 0 ? (
        <p className="text-ink-400 py-16 text-center text-sm">
          {selected ? `"${selected}" 업종 대상 공고가 없습니다.` : '등록된 공고가 없습니다.'}
        </p>
      ) : (
        <>
          <p className="text-ink-400 text-xs">
            전체 {totalCount}건 중 {programs.length}건 표시
          </p>
          <div className="space-y-3">
            {programs.map((program) => (
              <SupportProgramRow key={program.id} program={program} />
            ))}
          </div>
          {remaining > 0 && (
            <Link
              href={`/support?${moreParams.toString()}`}
              scroll={false}
              className="border-ink-200 text-ink-700 flex h-11 w-full items-center justify-center gap-1 rounded-xl border bg-white text-sm font-semibold"
            >
              더 보기 (남은 {remaining}건)
              <LuChevronDown className="h-4 w-4" />
            </Link>
          )}
        </>
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
