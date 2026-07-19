import { Suspense } from 'react';
import Link from 'next/link';

import {
  getApplicationIndustryFacetsQuery,
  getSignupApplicationsQuery,
} from './queries/signup-applications.query';
import { ApplicationRow } from './ui/application-row';

// 가입 심사 목록 — "심사 대기" / "처리 완료" 탭 + 업종 칩 필터(회원 업종별 분류 관리).
// 데이터 섹션은 Suspense 로 스트리밍(cacheComponents).
export default function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; industry?: string }>;
}) {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">가입 심사</h1>
      <Suspense fallback={<ListSkeleton />}>
        <ApplicationsSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ApplicationsSection({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; industry?: string }>;
}) {
  const { tab, industry } = await searchParams;
  const mode = tab === 'done' ? 'decided' : 'pending';
  const [applications, facets] = await Promise.all([
    getSignupApplicationsQuery(mode, industry),
    getApplicationIndustryFacetsQuery(mode),
  ]);
  const total = facets.reduce((sum, facet) => sum + facet.count, 0);
  const tabQuery = mode === 'decided' ? '?tab=done' : '';

  return (
    <div className="space-y-4">
      <nav className="flex gap-2">
        <TabLink href="/approvals" active={mode === 'pending'}>
          심사 대기
        </TabLink>
        <TabLink href="/approvals?tab=done" active={mode === 'decided'}>
          처리 완료
        </TabLink>
      </nav>

      {/* 업종 칩 — 현재 탭 모집단의 업종별 건수. 칩 클릭으로 필터, "전체"로 해제. */}
      {facets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <IndustryChip href={`/approvals${tabQuery}`} active={!industry}>
            전체 {total}
          </IndustryChip>
          {facets.map((facet) => (
            <IndustryChip
              key={facet.name}
              href={`/approvals${tabQuery ? `${tabQuery}&` : '?'}industry=${encodeURIComponent(facet.name)}`}
              active={industry === facet.name}
            >
              {facet.name} {facet.count}
            </IndustryChip>
          ))}
        </div>
      )}

      {applications.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
          {industry
            ? `"${industry}" 업종의 ${mode === 'pending' ? '대기 중인 신청이' : '처리된 신청이'} 없습니다.`
            : mode === 'pending'
              ? '심사 대기 중인 신청이 없습니다.'
              : '처리된 신청이 없습니다.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-semibold">회사명</th>
                <th className="px-4 py-3 font-semibold">신청자</th>
                <th className="px-4 py-3 font-semibold">업종</th>
                <th className="px-4 py-3 font-semibold">사업자등록번호</th>
                <th className="px-4 py-3 font-semibold">신청일</th>
                <th className="px-4 py-3 font-semibold">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <ApplicationRow key={application.userId} application={application} />
              ))}
            </tbody>
          </table>
        </div>
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

const IndustryChip = ({
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
    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
      active
        ? 'border-slate-900 bg-slate-900 text-white'
        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </Link>
);

const ListSkeleton = () => (
  <div className="space-y-3">
    <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
    <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
  </div>
);
