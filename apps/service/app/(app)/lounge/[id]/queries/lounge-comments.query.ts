import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

export type LoungeCommentView = {
  id: string;
  nickname: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null;
  verified: boolean;
  createdAt: Date;
  content: string;
  likeCount: number;
  replies: LoungeCommentView[];
};

export type LoungeCommentsQuery = { postId: string };

// 2단 스레드로 반환한다 — 최상위 댓글 + 각 댓글의 직속 답글(parentId 로 그룹).
export async function getLoungeCommentsQuery({
  postId,
}: LoungeCommentsQuery): Promise<LoungeCommentView[]> {
  const rows = await prisma.loungeComment.findMany({
    where: { postId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      createdAt: true,
      content: true,
      likeCount: true,
      parentId: true,
      author: {
        select: {
          name: true,
          executiveRole: true,
          jobTitle: true,
          approvedAt: true,
          loungeProfile: { select: { nickname: true } },
        },
      },
    },
  });

  const toView = (r: (typeof rows)[number]): Omit<LoungeCommentView, 'replies'> => ({
    id: r.id,
    nickname: r.author.loungeProfile?.nickname ?? r.author.name,
    executiveRole: r.author.executiveRole,
    jobTitle: r.author.jobTitle,
    verified: r.author.approvedAt != null,
    createdAt: r.createdAt,
    content: r.content,
    likeCount: r.likeCount,
  });

  const repliesByParent = new Map<string, LoungeCommentView[]>();
  for (const r of rows) {
    if (!r.parentId) continue;
    const list = repliesByParent.get(r.parentId) ?? [];
    list.push({ ...toView(r), replies: [] });
    repliesByParent.set(r.parentId, list);
  }

  return rows
    .filter((r) => r.parentId === null)
    .map((r) => ({ ...toView(r), replies: repliesByParent.get(r.id) ?? [] }));
}
