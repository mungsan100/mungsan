'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ApproveSignupCommand = { userId: string };

// 가입 승인 — 미승인(approvedAt null) 건만. 반려됐던 건도 승인 가능(오반려 복구 경로 —
// 이때 반려 기록은 지운다). 사전조건을 where 에 실은 updateMany 로 중복 처리 레이스를 DB 에서 닫는다.
export async function approveSignupAction(cmd: ApproveSignupCommand): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const updated = await prisma.user.updateMany({
    where: {
      id: cmd.userId,
      approvedAt: null,
      deletedAt: null,
      withdrawnAt: null,
      company: { isNot: null }, // 기업정보 없는 유저는 심사 대상 아님
    },
    data: { approvedAt: new Date(), rejectedAt: null, rejectedReason: null },
  });
  if (updated.count === 0)
    return { ok: false, code: 'NOT_APPROVABLE', message: '이미 승인됐거나 처리할 수 없는 신청입니다.' };

  revalidatePath('/approvals');
  revalidatePath(`/approvals/${cmd.userId}`);
  return { ok: true, data: undefined, message: '가입을 승인했습니다.' };
}
