'use server';

import { createHash } from 'node:crypto';
import { prisma } from '@mungsan/db';

import { hashPassword } from '@/lib/auth/password';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ResetPasswordCommand = { token: string; password: string };

const INVALID_TOKEN: ActionResult = {
  ok: false,
  code: 'INVALID_TOKEN',
  message: '링크가 만료됐거나 이미 사용됐습니다. 재설정을 다시 요청해 주세요.',
};

// 새 비밀번호 설정 — 토큰(미사용·미만료) 검증 후 비밀번호 교체.
// consumedAt 사전조건을 실은 updateMany로 재사용 레이스를 DB에서 닫고,
// 교체 시 모든 기기의 기존 세션을 파기한다(탈취 대비).
export async function resetPasswordAction(cmd: ResetPasswordCommand): Promise<ActionResult> {
  if (cmd.password.length < 8)
    return { ok: false, field: 'password', message: '비밀번호는 8자 이상이어야 합니다.' };

  const tokenHash = createHash('sha256').update(cmd.token).digest('hex');
  const verification = await prisma.verificationToken.findFirst({
    where: {
      tokenHash,
      purpose: 'PASSWORD_RESET',
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, userId: true },
  });
  if (!verification?.userId) return INVALID_TOKEN;

  const passwordHash = await hashPassword(cmd.password);

  const consumed = await prisma.$transaction(async (tx) => {
    const updated = await tx.verificationToken.updateMany({
      where: { id: verification.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (updated.count === 0) return false;

    await tx.user.update({
      where: { id: verification.userId ?? undefined },
      // 재설정 성공은 본인 확인이므로 로그인 실패 잠금도 함께 해제한다(잠금 안내 문구의 약속).
      data: { passwordHash, failedLoginCount: null, lockedUntil: null },
    });
    await tx.session.deleteMany({ where: { userId: verification.userId ?? undefined } });
    return true;
  });
  if (!consumed) return INVALID_TOKEN;

  return { ok: true, data: undefined, message: '비밀번호가 변경됐습니다. 새 비밀번호로 로그인해 주세요.' };
}
