'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ToggleLoungeLikeCommand = { postId: string };

// 좋아요 토글 — @@unique([postId, userId]) 로 중복이 막히고, 캐시 카운트를 같은 트랜잭션에서 증감한다.
export async function toggleLoungeLikeAction(
  cmd: ToggleLoungeLikeCommand,
): Promise<ActionResult<{ liked: boolean }>> {
  const user = await getCurrentUser();

  const existing = await prisma.loungePostLike.findUnique({
    where: { postId_userId: { postId: cmd.postId, userId: user.id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.loungePostLike.delete({ where: { id: existing.id } }),
      prisma.loungePost.update({
        where: { id: cmd.postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    revalidatePath(`/lounge/${cmd.postId}`);
    revalidatePath('/lounge');
    return { ok: true, data: { liked: false }, message: '좋아요를 취소했습니다.' };
  }

  await prisma.$transaction([
    prisma.loungePostLike.create({ data: { postId: cmd.postId, userId: user.id } }),
    prisma.loungePost.update({
      where: { id: cmd.postId },
      data: { likeCount: { increment: 1 } },
    }),
  ]);
  revalidatePath(`/lounge/${cmd.postId}`);
  revalidatePath('/lounge');
  return { ok: true, data: { liked: true }, message: '좋아요를 눌렀습니다.' };
}
