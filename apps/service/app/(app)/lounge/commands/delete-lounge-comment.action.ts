'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

// 라운지 댓글 본인 삭제 — 작성자만, 소프트 삭제(deletedAt). 글 삭제와 같은 updateMany 사전조건
// 패턴으로 타인 삭제·중복 삭제를 DB에서 차단. 답글 행은 남긴다 — 보이는 답글이 있는 부모는
// 조회 쿼리가 "삭제된 댓글" 자리로 대체한다. commentCount 캐시는 생성과 대칭으로 같은
// 트랜잭션에서 1 감소(남는 답글은 각자 생성 시 이미 +1 됐으므로 삭제된 본인 것만 뺀다).
export async function deleteLoungeCommentAction(cmd: {
  postId: string;
  commentId: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();

  const deleted = await prisma.$transaction(async (tx) => {
    const result = await tx.loungeComment.updateMany({
      where: { id: cmd.commentId, postId: cmd.postId, authorId: user.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) return false;
    await tx.loungePost.update({
      where: { id: cmd.postId },
      data: { commentCount: { decrement: 1 } },
    });
    return true;
  });

  if (!deleted)
    return {
      ok: false,
      code: 'NOT_DELETABLE',
      message: '이미 삭제됐거나 삭제 권한이 없는 댓글입니다.',
    };

  revalidatePath(`/lounge/${cmd.postId}`);
  revalidatePath('/lounge'); // 목록 카드의 댓글수 캐시 갱신
  return { ok: true, data: undefined, message: '댓글을 삭제했습니다.' };
}
