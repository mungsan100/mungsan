'use server';

import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { destroyOtherSessions } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ChangePasswordCommand = { currentPassword: string; newPassword: string };

// 비밀번호 변경(로그인 상태) — 현재 비밀번호 재확인 후 교체. 재설정(reset-password)과 달리
// 토큰이 필요 없고, 해시/검증(lib/auth/password)과 "타 세션 파기" 정책을 재사용한다 —
// 변경한 기기는 로그인 유지, 다른 기기는 전부 로그아웃(destroyOtherSessions).
export async function changePasswordAction(cmd: ChangePasswordCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (cmd.newPassword.length < 8)
    return { ok: false, field: 'newPassword', message: '새 비밀번호는 8자 이상이어야 합니다.' };
  if (cmd.currentPassword === cmd.newPassword)
    return { ok: false, field: 'newPassword', message: '현재 비밀번호와 다른 비밀번호를 사용해 주세요.' };

  const row = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!row.passwordHash || !(await verifyPassword(cmd.currentPassword, row.passwordHash)))
    return { ok: false, field: 'currentPassword', message: '현재 비밀번호가 올바르지 않습니다.' };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(cmd.newPassword) },
  });
  await destroyOtherSessions(user.id);

  return { ok: true, data: undefined, message: '비밀번호를 변경했습니다. 다른 기기는 로그아웃됩니다.' };
}
