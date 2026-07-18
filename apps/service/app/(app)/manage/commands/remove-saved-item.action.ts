'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type RemoveSavedItemCommand = { target: 'LOUNGE' | 'COLLAB'; postId: string };

// 저장 취소(관리 탭 저장 목록 전용) — 토글이 아니라 "제거"만 수행한다.
// 상세 화면 토글을 재사용하면 다른 화면에서 이미 해제된 뒤 누른 경우 재저장돼 버리는
// 역방향 레이스가 있어, deleteMany 결과 count를 사전조건으로 카운트 캐시도
// 실제 삭제된 경우에만 감소시킨다(updateMany 사전조건 컨벤션과 동일한 취지).
export async function removeSavedItemAction(cmd: RemoveSavedItemCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (cmd.target === 'LOUNGE') {
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.loungeBookmark.deleteMany({
        where: { postId: cmd.postId, userId: user.id },
      });
      if (deleted.count > 0)
        await tx.loungePost.update({
          where: { id: cmd.postId },
          data: { bookmarkCount: { decrement: 1 } },
        });
    });
    revalidatePath(`/lounge/${cmd.postId}`);
    revalidatePath('/lounge');
  } else {
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.collaborationBookmark.deleteMany({
        where: { postId: cmd.postId, userId: user.id },
      });
      if (deleted.count > 0)
        await tx.collaborationPost.update({
          where: { id: cmd.postId },
          data: { bookmarkCount: { decrement: 1 } },
        });
    });
    revalidatePath(`/collab/${cmd.postId}`);
    revalidatePath('/collab');
  }

  revalidatePath('/manage');
  return { ok: true, data: undefined, message: '저장을 취소했습니다.' };
}
