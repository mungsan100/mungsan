import 'server-only';

import { prisma } from '@mungsan/db';

// 콘텐츠 관리 목록 — 라운지 글/댓글·협업 공고를 한 화면에서 조회·검색하고
// 숨김(소프트) 상태·사유·처리자 이력을 보여준다. 회원 삭제 글(deletedAt)은 대상 밖.
export type ContentKind = 'LOUNGE_POST' | 'LOUNGE_COMMENT' | 'COLLABORATION_POST';

export type ContentRowView = {
  id: string;
  kind: ContentKind;
  title: string; // 댓글은 내용 절단을 제목처럼 사용
  excerpt: string;
  authorLabel: string; // 라운지=닉네임(가명 유지), 공고=회사명
  createdAt: Date;
  hiddenAt: Date | null;
  hiddenReason: string | null;
  hiddenByAdminName: string | null;
  pendingReportCount: number; // 대기 중 신고 수(신고 관리와의 연결 신호)
};

const LIST_TAKE = 50;

export async function getContentsQuery(kind: ContentKind, q?: string): Promise<ContentRowView[]> {
  const query = q?.trim() || null;
  const rows = await fetchRows(kind, query);

  // 처리자 이름·대기 신고 수 일괄 조회(N+1 방지).
  const adminIds = [...new Set(rows.map((r) => r.hiddenByAdminId).filter((v): v is string => !!v))];
  const admins = adminIds.length
    ? await prisma.admin.findMany({ where: { id: { in: adminIds } }, select: { id: true, name: true } })
    : [];
  const adminNameById = new Map(admins.map((a) => [a.id, a.name]));

  const ids = rows.map((r) => r.id);
  const reports = ids.length
    ? await prisma.report.groupBy({
        by: ['targetId'],
        where: { targetType: kind, targetId: { in: ids }, status: 'PENDING' },
        _count: true,
      })
    : [];
  const reportCountById = new Map(reports.map((r) => [r.targetId, r._count]));

  return rows.map((row) => ({
    id: row.id,
    kind,
    title: row.title,
    excerpt: row.excerpt,
    authorLabel: row.authorLabel,
    createdAt: row.createdAt,
    hiddenAt: row.hiddenAt,
    hiddenReason: row.hiddenReason,
    hiddenByAdminName: row.hiddenByAdminId
      ? (adminNameById.get(row.hiddenByAdminId) ?? '(삭제된 관리자)')
      : null,
    pendingReportCount: reportCountById.get(row.id) ?? 0,
  }));
}

type RawRow = {
  id: string;
  title: string;
  excerpt: string;
  authorLabel: string;
  createdAt: Date;
  hiddenAt: Date | null;
  hiddenReason: string | null;
  hiddenByAdminId: string | null;
};

async function fetchRows(kind: ContentKind, query: string | null): Promise<RawRow[]> {
  if (kind === 'LOUNGE_POST') {
    const posts = await prisma.loungePost.findMany({
      where: {
        deletedAt: null,
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: LIST_TAKE,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        hiddenAt: true,
        hiddenReason: true,
        hiddenByAdminId: true,
        author: { select: { loungeProfile: { select: { nickname: true } } } },
      },
    });
    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.content.slice(0, 80),
      authorLabel: p.author.loungeProfile?.nickname ?? '익명',
      createdAt: p.createdAt,
      hiddenAt: p.hiddenAt,
      hiddenReason: p.hiddenReason,
      hiddenByAdminId: p.hiddenByAdminId,
    }));
  }

  if (kind === 'LOUNGE_COMMENT') {
    const comments = await prisma.loungeComment.findMany({
      where: {
        deletedAt: null,
        ...(query ? { content: { contains: query, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: LIST_TAKE,
      select: {
        id: true,
        content: true,
        createdAt: true,
        hiddenAt: true,
        hiddenReason: true,
        hiddenByAdminId: true,
        author: { select: { loungeProfile: { select: { nickname: true } } } },
        post: { select: { title: true } },
      },
    });
    return comments.map((c) => ({
      id: c.id,
      title: c.content.slice(0, 60),
      excerpt: `게시글: ${c.post.title.slice(0, 40)}`,
      authorLabel: c.author.loungeProfile?.nickname ?? '익명',
      createdAt: c.createdAt,
      hiddenAt: c.hiddenAt,
      hiddenReason: c.hiddenReason,
      hiddenByAdminId: c.hiddenByAdminId,
    }));
  }

  const posts = await prisma.collaborationPost.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: LIST_TAKE,
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      hiddenAt: true,
      hiddenReason: true,
      hiddenByAdminId: true,
      author: { select: { name: true, company: { select: { name: true } } } },
    },
  });
  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.description.slice(0, 80),
    authorLabel: p.author.company?.name ?? p.author.name,
    createdAt: p.createdAt,
    hiddenAt: p.hiddenAt,
    hiddenReason: p.hiddenReason,
    hiddenByAdminId: p.hiddenByAdminId,
  }));
}
