'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import { deleteFile } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; code?: string; message: string };

// 명함 삭제(2026-07-21) — 소유자 본인만. row 삭제 후 blob 이미지도 정리한다(무FK라 파일 정리는 쓰기 경로 책임).
export async function deleteBusinessCardAction(cardId: string): Promise<ActionResult> {
  const user = await getCurrentUser();

  // 소유자 확인과 삭제를 한 조건으로 — 남의 명함 id 를 보내도 where 에서 걸러진다.
  const card = await prisma.businessCard.findFirst({
    where: { id: cardId, ownerId: user.id },
    select: { id: true, imagePathname: true },
  });
  if (!card) return { ok: false, code: 'NOT_FOUND', message: '명함을 찾을 수 없습니다.' };

  await prisma.businessCard.delete({ where: { id: card.id } });
  await deleteFile(card.imagePathname).catch(() => {}); // 이미지 정리 실패는 삭제 성공을 막지 않는다

  revalidatePath('/manage');
  return { ok: true, message: '명함을 삭제했습니다.' };
}
