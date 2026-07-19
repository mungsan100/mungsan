'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

const REASON_MAX_LENGTH = 500;

// 이용 정지 — 활성(정지·탈퇴·삭제 아님) 회원만. 사유는 선택 입력(rejectedReason 컨벤션 미러).
// 사전조건을 where 에 실은 updateMany 로 중복 처리 레이스를 DB 에서 닫는다(승인/반려 패턴).
// 같은 트랜잭션에서 전 세션을 파기해 로그인 중인 기기도 즉시 차단한다
// (다음 요청부터 middleware 가 /pending 정지 안내로 보냄).
export async function suspendMemberAction(cmd: {
  userId: string;
  reason?: string;
}): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const reason = cmd.reason?.trim() ?? '';
  if (reason.length > REASON_MAX_LENGTH)
    return {
      ok: false,
      code: 'REASON_TOO_LONG',
      message: `정지 사유는 ${REASON_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };

  const suspended = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id: cmd.userId, suspendedAt: null, withdrawnAt: null, deletedAt: null },
      data: { suspendedAt: new Date(), suspendedReason: reason.length > 0 ? reason : null },
    });
    if (updated.count === 0) return false;
    await tx.session.deleteMany({ where: { userId: cmd.userId } });
    return true;
  });
  if (!suspended)
    return { ok: false, code: 'NOT_SUSPENDABLE', message: '이미 정지됐거나 정지할 수 없는 회원입니다.' };

  revalidatePath('/members');
  revalidatePath(`/members/${cmd.userId}`);
  return { ok: true, data: undefined, message: '이용을 정지했습니다.' };
}

// 정지 해제 — 정지 상태인 회원만. suspendedAt·사유 null 복원(세션은 회원이 다시 로그인해야 생긴다).
export async function unsuspendMemberAction(cmd: { userId: string }): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const updated = await prisma.user.updateMany({
    where: { id: cmd.userId, suspendedAt: { not: null }, deletedAt: null },
    data: { suspendedAt: null, suspendedReason: null },
  });
  if (updated.count === 0)
    return { ok: false, code: 'NOT_UNSUSPENDABLE', message: '정지 상태가 아닌 회원입니다.' };

  revalidatePath('/members');
  revalidatePath(`/members/${cmd.userId}`);
  return { ok: true, data: undefined, message: '정지를 해제했습니다.' };
}
