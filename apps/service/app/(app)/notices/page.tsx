import { Suspense } from 'react';

import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { BackHeader } from '../ui/back-header';
import { getNoticesQuery } from '../queries/notices.query';

// 공지사항 목록(IA 2차) — 더보기 > 공지사항. 게시된 운영 공지 전체.
export default function NoticesPage() {
  return (
    <>
      <BackHeader />
      <main className="space-y-4 px-5 pt-3 pb-24">
        <h1 className="text-ink-900 text-xl font-bold">공지사항</h1>
        <Suspense fallback={<NoticesSkeleton />}>
          <NoticesList />
        </Suspense>
      </main>
    </>
  );
}

async function NoticesList() {
  const notices = await getNoticesQuery();
  if (notices.length === 0)
    return <p className="text-ink-400 py-12 text-center text-sm">등록된 공지사항이 없습니다.</p>;

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <article key={notice.id} className="shadow-card rounded-2xl bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-ink-900 text-[15px] font-bold">{notice.title}</h2>
            <span className="text-ink-400 shrink-0 text-[12px]">
              {formatRelativeKorean(notice.publishedAt)}
            </span>
          </div>
          <p className="text-ink-600 mt-2 text-[13px] leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </p>
        </article>
      ))}
    </div>
  );
}

const NoticesSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-ink-100 h-24 animate-pulse rounded-2xl" />
    ))}
  </div>
);
