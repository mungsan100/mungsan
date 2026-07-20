'use server';

import { revalidatePath } from 'next/cache';
import { prisma, DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

export type UpdateLoungeCategoryCommand = { postId: string; category: DB.LoungeCategory };

// 카테고리 수동 수정(2026-07-20, 5-3) — AI 자동 분류 결과를 작성자 본인이 바로잡는다.
// 사전조건(작성자·미삭제)을 where 에 실은 updateMany 로 타인 수정을 DB 에서 차단한다.
export async function updateLoungeCategoryAction(
  cmd: UpdateLoungeCategoryCommand,
): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!(Object.values(DB.LoungeCategory) as string[]).includes(cmd.category))
    return { ok: false, code: 'INVALID_CATEGORY', message: '올바른 카테고리가 아닙니다.' };

  const updated = await prisma.loungePost.updateMany({
    where: { id: cmd.postId, authorId: user.id, deletedAt: null },
    data: { category: cmd.category },
  });
  if (updated.count === 0)
    return { ok: false, code: 'NOT_EDITABLE', message: '수정 권한이 없는 글입니다.' };

  revalidatePath(`/lounge/${cmd.postId}`);
  revalidatePath('/lounge');
  return { ok: true, data: undefined, message: '카테고리를 변경했습니다.' };
}
