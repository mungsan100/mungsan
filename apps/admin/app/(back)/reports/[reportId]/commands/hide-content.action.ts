'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type HideContentCommand = { reportId: string };

// 신고 조치: 콘텐츠 숨김 — 대상의 hiddenAt 기록(삭제 아님, null 복원으로 되돌림) 후
// 같은 대상의 대기 신고 전부를 CONTENT_HIDDEN 으로 일괄 종료(하나 숨기면 나머지도 목적 달성).
// status PENDING 사전조건으로 중복 처리 레이스를 닫는다.
export async function hideContentAction(cmd: HideContentCommand): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const done = await prisma.$transaction(async (tx) => {
    const report = await tx.report.findFirst({
      where: { id: cmd.reportId, status: 'PENDING' },
      select: { targetType: true, targetId: true },
    });
    if (!report) return false;

    await hideTarget(tx, report.targetType, report.targetId);

    // 자기 자신 포함, 같은 대상의 PENDING 신고 일괄 종료(where 의 PENDING 조건이 레이스 가드).
    await tx.report.updateMany({
      where: { targetType: report.targetType, targetId: report.targetId, status: 'PENDING' },
      data: { status: 'CONTENT_HIDDEN', resolvedAt: new Date(), resolvedByAdminId: admin.id },
    });
    return true;
  });
  if (!done) return { ok: false, code: 'NOT_PENDING', message: '이미 처리된 신고입니다.' };

  revalidatePath('/reports');
  revalidatePath(`/reports/${cmd.reportId}`);
  return { ok: true, data: undefined, message: '콘텐츠를 숨기고 신고를 처리했습니다.' };
}

// 이미 숨겨진 대상은 최초 숨김 시각을 보존한다(hiddenAt null 조건).
async function hideTarget(
  tx: DB.Prisma.TransactionClient,
  targetType: DB.ReportTargetType,
  targetId: string,
): Promise<void> {
  const where = { id: targetId, hiddenAt: null };
  const data = { hiddenAt: new Date() };
  switch (targetType) {
    case 'LOUNGE_POST':
      await tx.loungePost.updateMany({ where, data });
      return;
    case 'LOUNGE_COMMENT':
      await tx.loungeComment.updateMany({ where, data });
      return;
    case 'COLLABORATION_POST':
      await tx.collaborationPost.updateMany({ where, data });
      return;
  }
}
