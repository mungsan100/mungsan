import 'server-only';

import { prisma } from '@mungsan/db';

// 홈 공지 배너(2026-07-20, 4-1) — 게시(publishedAt not null)된 공지를 최신순 소수 노출.
export type HomeAnnouncement = {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
};

const HOME_TAKE = 3;

export async function getHomeAnnouncementsQuery(): Promise<HomeAnnouncement[]> {
  const rows = await prisma.announcement.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: HOME_TAKE,
    select: { id: true, title: true, content: true, publishedAt: true },
  });
  // publishedAt not null 로 걸렀으므로 non-null 단언 안전(타입만 좁힌다).
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    publishedAt: row.publishedAt as Date,
  }));
}
