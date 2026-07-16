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

export async function loginAction(cmd: LoginCommand): Promise<ActionResult> {
  const email = cmd.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // 계정 존재 여부가 드러나지 않도록 미가입/오탈퇴/오비밀번호 모두 동일 메시지로 응답한다.
  if (!user || !user.passwordHash || user.deletedAt || user.withdrawnAt) return INVALID_CREDENTIALS;

  const valid = await verifyPassword(cmd.password, user.passwordHash);
  if (!valid) return INVALID_CREDENTIALS;

  await createSession(user.id);
  redirect('/');
}
