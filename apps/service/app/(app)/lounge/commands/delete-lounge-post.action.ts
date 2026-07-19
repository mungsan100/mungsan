'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

// 라운지 글 본인 삭제 — 작성자만, 소프트 삭제(deletedAt). 사전조건을 where에 실은 updateMany로
// 타인 삭제·중복 삭제를 DB에서 차단(respond-proposal 패턴). 댓글·좋아요·북마크 행은 남기고
// 글만 노출 대상에서 뺀다 — 목록/상세/저장 쿼리가 전부 deletedAt: null 을 거르므로 그걸로 충분.
export async function deleteLoungePostAction(cmd: { postId: string }): Promise<ActionResult> {
  const user = await getCurrentUser();

  const deleted = await prisma.loungePost.updateMany({
    where: { id: cmd.postId, authorId: user.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (deleted.count === 0)
    return {
      ok: false,
      code: 'NOT_DELETABLE',
      message: '이미 삭제됐거나 삭제 권한이 없는 글입니다.',
    };

  revalidatePath('/lounge');
  revalidatePath('/manage'); // 저장한 글 목록에서 제외
  return { ok: true, data: undefined, message: '글을 삭제했습니다.' };
}
