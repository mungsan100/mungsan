'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type DismissReportCommand = { reportId: string };

// 신고 반려 — 콘텐츠 조치 없이 해당 신고만 종료. status PENDING 사전조건으로 레이스 차단.
export async function dismissReportAction(cmd: DismissReportCommand): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const updated = await prisma.report.updateMany({
    where: { id: cmd.reportId, status: 'PENDING' },
    data: { status: 'DISMISSED', resolvedAt: new Date(), resolvedByAdminId: admin.id },
  });
  if (updated.count === 0) return { ok: false, code: 'NOT_PENDING', message: '이미 처리된 신고입니다.' };

  revalidatePath('/reports');
  revalidatePath(`/reports/${cmd.reportId}`);
  return { ok: true, data: undefined, message: '신고를 반려 처리했습니다.' };
}
