'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ToggleCollabBookmarkCommand = { postId: string };

export async function toggleCollabBookmarkAction(
  cmd: ToggleCollabBookmarkCommand,
): Promise<ActionResult<{ bookmarked: boolean }>> {
  const user = await getCurrentUser(); // 1. 인증

  const existing = await prisma.collaborationBookmark.findUnique({
    where: { postId_userId: { postId: cmd.postId, userId: user.id } },
    select: { id: true },
  }); // 2. 로드

  // 3~4. 토글 영속화 + 무효화. 카운트 캐시는 같은 트랜잭션에서 증감.
  if (existing) {
    try {
      await prisma.$transaction([
        prisma.collaborationBookmark.delete({ where: { id: existing.id } }),
        prisma.collaborationPost.update({
          where: { id: cmd.postId },
          data: { bookmarkCount: { decrement: 1 } },
        }),
      ]);
    } catch {
      // 동시 해제 레이스 — 이미 삭제된 뒤 재호출되면 P2025. create 분기와 대칭.
      return { ok: false, code: 'CONFLICT', message: '이미 해제된 공고입니다.' };
    }
    revalidatePath(`/collab/${cmd.postId}`);
    return { ok: true, data: { bookmarked: false }, message: '저장을 해제했습니다.' };
  }

  try {
    await prisma.$transaction([
      prisma.collaborationBookmark.create({ data: { postId: cmd.postId, userId: user.id } }),
      prisma.collaborationPost.update({
        where: { id: cmd.postId },
        data: { bookmarkCount: { increment: 1 } },
      }),
    ]);
  } catch {
    // 동시 클릭 레이스 — unique([postId,userId])가 중복 저장을 막는다.
    return { ok: false, code: 'CONFLICT', message: '이미 저장한 공고입니다.' };
  }
  revalidatePath(`/collab/${cmd.postId}`);
  return { ok: true, data: { bookmarked: true }, message: '공고를 저장했습니다.' };
}
