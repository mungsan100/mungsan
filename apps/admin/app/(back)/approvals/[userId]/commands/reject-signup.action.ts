'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type RejectSignupCommand = { userId: string; reason?: string };

const REASON_MAX_LENGTH = 500;

// 가입 반려 — 심사 대기(승인도 반려도 안 된) 건만. 사유는 선택 입력.
// 사전조건을 where 에 실은 updateMany 로 중복 처리 레이스를 DB 에서 닫는다.
export async function rejectSignupAction(cmd: RejectSignupCommand): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const reason = cmd.reason?.trim() ?? '';
  if (reason.length > REASON_MAX_LENGTH)
    return {
      ok: false,
      code: 'REASON_TOO_LONG',
      field: 'reason',
      message: `반려 사유는 ${REASON_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };

  const updated = await prisma.user.updateMany({
    where: {
      id: cmd.userId,
      approvedAt: null,
      rejectedAt: null,
      deletedAt: null,
      withdrawnAt: null,
      company: { isNot: null },
    },
    data: { rejectedAt: new Date(), rejectedReason: reason.length > 0 ? reason : null },
  });
  if (updated.count === 0)
    return { ok: false, code: 'NOT_REJECTABLE', message: '이미 처리됐거나 반려할 수 없는 신청입니다.' };

  revalidatePath('/approvals');
  revalidatePath(`/approvals/${cmd.userId}`);
  return { ok: true, data: undefined, message: '가입을 반려했습니다.' };
}
