'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ToggleLoungeCommentLikeCommand = { commentId: string; postId: string };

// 댓글 좋아요 토글 — @@unique([commentId, userId])로 중복이 막히고, 캐시 카운트를 같은 트랜잭션에서 증감한다.
export async function toggleLoungeCommentLikeAction(
  cmd: ToggleLoungeCommentLikeCommand,
): Promise<ActionResult<{ liked: boolean }>> {
  const user = await getCurrentUser();

  const existing = await prisma.loungeCommentLike.findUnique({
    where: { commentId_userId: { commentId: cmd.commentId, userId: user.id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.loungeCommentLike.delete({ where: { id: existing.id } }),
      prisma.loungeComment.update({
        where: { id: cmd.commentId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    revalidatePath(`/lounge/${cmd.postId}`);
    return { ok: true, data: { liked: false }, message: '좋아요를 취소했습니다.' };
  }

  await prisma.$transaction([
    prisma.loungeCommentLike.create({ data: { commentId: cmd.commentId, userId: user.id } }),
    prisma.loungeComment.update({
      where: { id: cmd.commentId },
      data: { likeCount: { increment: 1 } },
    }),
  ]);
  revalidatePath(`/lounge/${cmd.postId}`);
  return { ok: true, data: { liked: true }, message: '좋아요를 눌렀습니다.' };
}
