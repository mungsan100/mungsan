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
  isMine: boolean; // 본인 댓글 → 신고 대신 삭제 버튼(글 상세와 같은 배타 규칙)
  isDeleted: boolean; // 본인 삭제됐지만 답글 보존을 위해 자리만 남은 댓글 — 내용은 서버에서 비운다
  replies: LoungeCommentView[];
};

export type LoungeCommentsQuery = { postId: string; userId: string };

// 2단 스레드로 반환한다 — 최상위 댓글 + 각 댓글의 직속 답글(parentId 로 그룹).
// 삭제(deletedAt) 행도 조회에 포함하는 이유: 보이는 답글이 달린 삭제 댓글은 자리를 지워버리면
// 타인의 답글까지 통째로 사라진다 → "삭제된 댓글" 자리로 대체한다(내용·작성자는 여기서 마스킹).
// 운영 숨김(hiddenAt)은 기존대로 스레드째 감춘다 — 숨김 사실 자체를 노출하지 않는 정책 유지.
export async function getLoungeCommentsQuery({
  postId,
  userId,
}: LoungeCommentsQuery): Promise<LoungeCommentView[]> {
  const rows = await prisma.loungeComment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      createdAt: true,
      content: true,
      likeCount: true,
      parentId: true,
      authorId: true,
      deletedAt: true,
      hiddenAt: true,
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

  const isVisible = (r: (typeof rows)[number]) => r.deletedAt === null && r.hiddenAt === null;

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
    isMine: r.authorId === userId,
    isDeleted: false,
  });

  const repliesByParent = new Map<string, LoungeCommentView[]>();
  for (const r of rows) {
    if (!r.parentId || !isVisible(r)) continue;
    const list = repliesByParent.get(r.parentId) ?? [];
    list.push({ ...toView(r), replies: [] });
    repliesByParent.set(r.parentId, list);
  }

  return rows
    .filter((r) => r.parentId === null)
    .flatMap((r) => {
      const replies = repliesByParent.get(r.id) ?? [];
      if (isVisible(r)) return [{ ...toView(r), replies }];
      if (r.hiddenAt !== null || replies.length === 0) return [];
      return [
        {
          id: r.id,
          nickname: '',
          executiveRole: 'OTHER' as const,
          jobTitle: null,
          verified: false,
          createdAt: r.createdAt,
          content: '',
          likeCount: 0,
          liked: false,
          isMine: false,
          isDeleted: true,
          replies,
        },
      ];
    });
}
