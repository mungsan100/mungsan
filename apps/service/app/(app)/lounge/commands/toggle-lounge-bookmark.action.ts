'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ToggleLoungeBookmarkCommand = { postId: string };

// 북마크 토글 — @@unique([postId, userId]) 로 중복이 막히고, 캐시 카운트를 같은 트랜잭션에서 증감한다.
export async function toggleLoungeBookmarkAction(
  cmd: ToggleLoungeBookmarkCommand,
): Promise<ActionResult<{ bookmarked: boolean }>> {
  const user = await getCurrentUser();

  const existing = await prisma.loungeBookmark.findUnique({
    where: { postId_userId: { postId: cmd.postId, userId: user.id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.loungeBookmark.delete({ where: { id: existing.id } }),
      prisma.loungePost.update({
        where: { id: cmd.postId },
        data: { bookmarkCount: { decrement: 1 } },
      }),
    ]);
    revalidatePath(`/lounge/${cmd.postId}`);
    revalidatePath('/lounge');
    return { ok: true, data: { bookmarked: false }, message: '북마크를 해제했습니다.' };
  }

  await prisma.$transaction([
    prisma.loungeBookmark.create({ data: { postId: cmd.postId, userId: user.id } }),
    prisma.loungePost.update({
      where: { id: cmd.postId },
      data: { bookmarkCount: { increment: 1 } },
    }),
  ]);
  revalidatePath(`/lounge/${cmd.postId}`);
  revalidatePath('/lounge');
  return { ok: true, data: { bookmarked: true }, message: '북마크에 저장했습니다.' };
}
