'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

// 협업 공고 본인 삭제 — 작성자만, 소프트 삭제(deletedAt). 사전조건을 where에 실은 updateMany로
// 타인 삭제·중복 삭제를 DB에서 차단. 목록/상세/저장 쿼리가 deletedAt: null 을 걸러 즉시 사라지고,
// 새 제안도 차단된다(create-proposal 이 deletedAt: null 을 확인). 이미 주고받은 제안·프로젝트는
// 그대로 둔다 — 진행되던 논의 기록은 삭제로 증발시키지 않는다.
export async function deleteCollabPostAction(cmd: { postId: string }): Promise<ActionResult> {
  const user = await getCurrentUser();

  const deleted = await prisma.collaborationPost.updateMany({
    where: { id: cmd.postId, authorId: user.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (deleted.count === 0)
    return {
      ok: false,
      code: 'NOT_DELETABLE',
      message: '이미 삭제됐거나 삭제 권한이 없는 공고입니다.',
    };

  revalidatePath('/collab');
  revalidatePath('/manage'); // 저장 목록·제안 화면 갱신
  return { ok: true, data: undefined, message: '공고를 삭제했습니다.' };
}
