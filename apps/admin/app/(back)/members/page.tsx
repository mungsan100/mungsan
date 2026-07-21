import { Suspense } from 'react';
import Link from 'next/link';

import {
  getMembersQuery,
  getMemberStatusCountsQuery,
  type MemberStatusFilter,
} from './queries/members.query';
import { MemberRow } from './ui/member-row';

// 회원 관리(P1) — 목록·검색·상세 진입 + 이용 정지/해제(상세에서). 최근 가입순 100명.
const TABS: { key: MemberStatusFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '활성' },
  { key: 'suspended', label: '정지' },
  { key: 'withdrawn', label: '탈퇴' },
];

export default function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">회원 관리</h1>
      <Suspense fallback={<ListSkeleton />}>
        <MembersSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MembersSection({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status: MemberStatusFilter = TABS.some((t) => t.key === params.status)
    ? (params.status as MemberStatusFilter)
    : 'all';
  const q = params.q?.trim() || undefined;
  const [members, counts] = await Promise.all([
    getMembersQuery(status, q),
    getMemberStatusCountsQuery(),
  ]);

  return (
    <div className="space-y-4">
      <nav className="flex gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/members?status=${tab.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              status === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label} {counts[tab.key]}
          </Link>
        ))}
      </nav>

      {/* 검색 — GET 폼(서버 렌더 유지). 상태 탭 유지를 위해 status 를 hidden 으로 싣는다. */}
      <form action="/members" className="flex gap-2">
        <input type="hidden" name="status" value={status} />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="이름·이메일·회사명 검색"
          className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
        >
          검색
        </button>
      </form>

      {members.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
          {q ? `"${q}" 검색 결과가 없습니다.` : '해당 상태의 회원이 없습니다.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="whitespace-nowrap px-4 py-3 font-semibold">이름</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">이메일</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">회사</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">업종</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">가입일</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <MemberRow key={member.userId} member={member} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const ListSkeleton = () => (
  <div className="space-y-3">
    <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
    <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
  </div>
);
