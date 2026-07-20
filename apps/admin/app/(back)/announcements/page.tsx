import { Suspense } from 'react';

import { getAnnouncementsQuery } from './queries/announcements.query';
import { AnnouncementComposer } from './ui/announcement-composer';
import { AnnouncementRow } from './ui/announcement-row';

// 공지 관리(2026-07-20, 4-1 B안) — 작성 + 게시/내림 + 알림 발송 옵션.
export default function AnnouncementsPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">공지 관리</h1>
      <AnnouncementComposer />
      <Suspense fallback={<ListSkeleton />}>
        <AnnouncementList />
      </Suspense>
    </main>
  );
}

async function AnnouncementList() {
  const announcements = await getAnnouncementsQuery();
  if (announcements.length === 0)
    return (
      <p className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
        작성된 공지가 없습니다.
      </p>
    );
  return (
    <ul className="space-y-3">
      {announcements.map((announcement) => (
        <AnnouncementRow key={announcement.id} announcement={announcement} />
      ))}
    </ul>
  );
}

const ListSkeleton = () => <div className="h-40 animate-pulse rounded-xl bg-slate-200" />;
