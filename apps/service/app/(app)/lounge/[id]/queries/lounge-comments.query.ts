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
  liked: boolean; // 현재 유저가 이 댓글에 좋아요를 눌렀는지
  replies: LoungeCommentView[];
};

export type LoungeCommentsQuery = { postId: string; userId: string };

// 2단 스레드로 반환한다 — 최상위 댓글 + 각 댓글의 직속 답글(parentId 로 그룹).
export async function getLoungeCommentsQuery({
  postId,
  userId,
}: LoungeCommentsQuery): Promise<LoungeCommentView[]> {
  const rows = await prisma.loungeComment.findMany({
    where: { postId, deletedAt: null, hiddenAt: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      createdAt: true,
      content: true,
      likeCount: true,
      parentId: true,
      author: {
        select: {
          executiveRole: true,
          jobTitle: true,
          approvedAt: true,
          loungeProfile: { select: { nickname: true } },
        },
      },
      likes: { where: { userId }, select: { id: true }, take: 1 },
    },
  });

  const toView = (r: (typeof rows)[number]): Omit<LoungeCommentView, 'replies'> => ({
    id: r.id,
    nickname: r.author.loungeProfile?.nickname ?? '익명',
    executiveRole: r.author.executiveRole,
    jobTitle: r.author.jobTitle,
    verified: r.author.approvedAt != null,
    createdAt: r.createdAt,
    content: r.content,
    likeCount: r.likeCount,
    liked: r.likes.length > 0,
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
