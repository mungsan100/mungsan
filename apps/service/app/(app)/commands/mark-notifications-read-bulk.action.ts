'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

// 알림 일괄 읽음(2026-07-22) — 알림 페이지 진입 시 화면에 나온 알림을 자동 읽음 처리한다.
// 단건(mark-notification-read)과 같은 컨벤션: 본인·미읽음 사전조건을 where 에 실어
// 남의 알림 id 가 섞여 와도 DB 에서 걸러진다. 벨 카운트는 (app) 레이아웃 소속이라
// layout 범위 revalidate — 단, 바뀐 게 없으면(0건) 재검증도 생략해 불필요한 리렌더를 막는다.
const MAX_BULK = 200; // 페이지 목록 take(100)보다 넉넉한 상한 — 임의 대량 호출 방지

export async function markNotificationsReadBulkAction(cmd: {
  notificationIds: string[];
}): Promise<ActionResult<{ count: number }>> {
  const user = await getCurrentUser();

  const ids = [...new Set(cmd.notificationIds)].filter((id) => typeof id === 'string').slice(0, MAX_BULK);
  if (ids.length === 0) return { ok: true, data: { count: 0 }, message: '읽음 처리할 알림이 없습니다.' };

  const updated = await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  if (updated.count > 0) revalidatePath('/', 'layout');
  return { ok: true, data: { count: updated.count }, message: '알림을 읽음 처리했습니다.' };
}

// 전체 읽음 — "모두 읽음" 버튼. 탭과 무관하게 내 미읽음 전부를 읽음으로 돌린다.
export async function markAllNotificationsReadAction(): Promise<ActionResult<{ count: number }>> {
  const user = await getCurrentUser();

  const updated = await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  if (updated.count > 0) revalidatePath('/', 'layout');
  return { ok: true, data: { count: updated.count }, message: '모든 알림을 읽음 처리했습니다.' };
}
