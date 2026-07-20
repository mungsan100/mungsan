'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@mungsan/db';

import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type LoginCommand = { email: string; password: string };

const INVALID_CREDENTIALS: ActionResult = {
  ok: false,
  code: 'INVALID_CREDENTIALS',
  field: 'password',
  message: '이메일 또는 비밀번호가 올바르지 않습니다.',
};

// 로그인 실패 잠금(2026-07-20 보안) — 무차별 대입 방지. OWASP 통상 범위의 보수적 기본값.
// 남은 실패 횟수는 공격자에게 정보가 되므로 노출하지 않고, 잠금 발동/유지 시에만 별도 안내한다.
const LOCK_THRESHOLD = 5; // 연속 실패 허용 횟수
const LOCK_DURATION_MS = 15 * 60 * 1000; // 잠금 시간 15분

export async function loginAction(cmd: LoginCommand): Promise<ActionResult> {
  const email = cmd.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // 계정 존재 여부가 드러나지 않도록 미가입/오탈퇴/오비밀번호 모두 동일 메시지로 응답한다.
  if (!user || !user.passwordHash || user.deletedAt || user.withdrawnAt) return INVALID_CREDENTIALS;

  // 잠금 중 — 정상 사용자가 비밀번호를 잊은 경우일 수 있어 재설정 경로를 함께 안내한다
  // (로그인 화면의 "비밀번호 재설정" 링크, 재설정 완료 시 잠금도 풀린다).
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.max(1, Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000));
    return {
      ok: false,
      code: 'LOCKED',
      field: 'password',
      message: `로그인 시도가 여러 번 실패해 잠시 제한되었습니다. 약 ${minutesLeft}분 후 다시 시도하거나, '비밀번호 재설정'으로 바로 잠금을 풀 수 있습니다.`,
    };
  }

  const valid = await verifyPassword(cmd.password, user.passwordHash);
  if (!valid) {
    const failed = (user.failedLoginCount ?? 0) + 1;
    const locking = failed >= LOCK_THRESHOLD;
    await prisma.user.update({
      where: { id: user.id },
      // 잠금 발동 시 카운트는 리셋(null) — 잠금 만료 후에는 다시 1부터 센다.
      data: locking
        ? { failedLoginCount: null, lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) }
        : { failedLoginCount: failed },
    });
    if (locking)
      return {
        ok: false,
        code: 'LOCKED',
        field: 'password',
        message:
          "비밀번호가 연속으로 5회 틀려 15분간 로그인이 제한됩니다. 비밀번호를 잊으셨다면 '비밀번호 재설정'을 이용해 주세요.",
      };
    return INVALID_CREDENTIALS;
  }

  // 성공 — 실패 기록이 있으면 초기화(기록 없는 정상 로그인엔 불필요한 쓰기 생략).
  if ((user.failedLoginCount ?? 0) > 0 || user.lockedUntil)
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: null, lockedUntil: null },
    });

  await createSession(user.id);
  redirect('/');
}
