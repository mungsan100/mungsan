import 'server-only';

import { prisma } from '@mungsan/db';

// 공지사항 목록(2026-07-21 IA 2차) — 게시(publishedAt not null)된 공지 전체를 최신순으로.
export type Notice = {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
};

export async function getNoticesQuery(): Promise<Notice[]> {
  const rows = await prisma.announcement.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    select: { id: true, title: true, content: true, publishedAt: true },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    publishedAt: row.publishedAt as Date,
  }));
}
