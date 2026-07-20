import 'server-only';

import { prisma } from '@mungsan/db';

// 문의 관리 목록(2026-07-20, 3-1) — 대기/처리완료 탭. 문의자 이름·회사 함께 표시.
export type InquiryListItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  resolvedAt: Date | null;
  adminNote: string | null;
  authorName: string;
  authorEmail: string;
  companyName: string | null;
};

const LIST_TAKE = 100;

export async function getInquiriesQuery(mode: 'pending' | 'resolved'): Promise<InquiryListItem[]> {
  const inquiries = await prisma.inquiry.findMany({
    where: { resolvedAt: mode === 'resolved' ? { not: null } : null },
    orderBy: { createdAt: mode === 'resolved' ? 'desc' : 'asc' }, // 대기는 오래된 순(먼저 온 것부터)
    take: LIST_TAKE,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      resolvedAt: true,
      adminNote: true,
      author: {
        select: { name: true, email: true, company: { select: { name: true } } },
      },
    },
  });

  return inquiries.map((inquiry) => ({
    id: inquiry.id,
    title: inquiry.title,
    content: inquiry.content,
    createdAt: inquiry.createdAt,
    resolvedAt: inquiry.resolvedAt,
    adminNote: inquiry.adminNote,
    authorName: inquiry.author.name,
    authorEmail: inquiry.author.email,
    companyName: inquiry.author.company?.name ?? null,
  }));
}

export async function getPendingInquiryCountQuery(): Promise<number> {
  return prisma.inquiry.count({ where: { resolvedAt: null } });
}
