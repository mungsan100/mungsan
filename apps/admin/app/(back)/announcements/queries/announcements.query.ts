import 'server-only';

import { prisma } from '@mungsan/db';

// 공지 관리 목록(2026-07-20, 4-1) — 게시/미게시 전부, 최신순.
export type AnnouncementListItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  publishedAt: Date | null;
  notifiedAt: Date | null;
};

export async function getAnnouncementsQuery(): Promise<AnnouncementListItem[]> {
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      publishedAt: true,
      notifiedAt: true,
    },
  });
}
