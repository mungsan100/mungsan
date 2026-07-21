'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

// 알림 읽음 처리 — 본인 알림·미읽음일 때만 readAt 기록(updateMany 사전조건 컨벤션).
// 이미 읽었거나 남의 알림이면 조용히 no-op(ok) — 카드 클릭 UX 를 막을 이유가 없다.
export async function markNotificationReadAction(cmd: {
  notificationId: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();

  await prisma.notification.updateMany({
    where: { id: cmd.notificationId, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  // layout 재검증 — 홈 의사결정 알림·알림 페이지 목록뿐 아니라 (app) 레이아웃의 공통 벨
  // 미확인 카운트까지 갱신한다(벨은 모든 탭 공통이라 페이지 단위 재검증으론 안 바뀐다).
  revalidatePath('/', 'layout');
  return { ok: true, data: undefined, message: '알림을 읽음 처리했습니다.' };
}
