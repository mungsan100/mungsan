import { Suspense } from 'react';
import Link from 'next/link';

import { getContentsQuery, type ContentKind } from './queries/contents.query';
import { ContentRow } from './ui/content-row';

// 콘텐츠 관리 — 라운지 글/댓글·협업 공고 목록 조회 + 검색 + 숨김(소프트)/해제.
// 숨김 사유·처리자·시각이 행에 남고, 대기 신고가 있으면 배지로 신고 관리와 연결된다.
const TABS: { key: ContentKind; label: string }[] = [
  { key: 'LOUNGE_POST', label: '라운지 글' },
  { key: 'LOUNGE_COMMENT', label: '라운지 댓글' },
  { key: 'COLLABORATION_POST', label: '협업 공고' },
];

export default function ContentsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; q?: string }>;
}) {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">콘텐츠 관리</h1>
      <Suspense fallback={<ListSkeleton />}>
        <ContentsSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ContentsSection({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; q?: string }>;
}) {
  const params = await searchParams;
  const kind: ContentKind = TABS.some((t) => t.key === params.kind)
    ? (params.kind as ContentKind)
    : 'LOUNGE_POST';
  const q = params.q?.trim() || undefined;
  const contents = await getContentsQuery(kind, q);

  return (
    <div className="space-y-4">
      <nav className="flex gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/contents?kind=${tab.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              kind === tab.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* 검색 — GET 폼(서버 렌더 유지). 탭 유지를 위해 kind 를 hidden 으로 싣는다. */}
      <form action="/contents" className="flex gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="제목·내용 검색"
          className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          검색
        </button>
      </form>

      {contents.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
          {q ? `"${q}" 검색 결과가 없습니다.` : '콘텐츠가 없습니다.'}
        </p>
      ) : (
        <div className="space-y-2.5">
          {contents.map((content) => (
            <ContentRow key={content.id} content={content} />
          ))}
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
