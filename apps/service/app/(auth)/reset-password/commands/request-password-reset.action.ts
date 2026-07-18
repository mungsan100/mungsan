'use server';

import { createHash, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { prisma } from '@mungsan/db';

import { sendPasswordResetEmail } from '@/lib/email/send-password-reset-email';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type RequestPasswordResetCommand = { email: string };

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30분

// 재설정 요청 — 계정 존재 여부가 드러나지 않도록 어떤 입력이든 동일한 성공 응답을 준다.
// 실제 발급·발송은 유효 계정(미탈퇴·미삭제)일 때만. 새 토큰 발급 시 기존 미사용 토큰은 무효화.
export async function requestPasswordResetAction(
  cmd: RequestPasswordResetCommand,
): Promise<ActionResult> {
  const email = cmd.email.trim().toLowerCase();
  if (!email) return { ok: false, field: 'email', message: '이메일을 입력해 주세요.' };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, deletedAt: true, withdrawnAt: true },
  });

  if (user?.passwordHash && !user.deletedAt && !user.withdrawnAt) {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.$transaction(async (tx) => {
      // 이전 미사용 재설정 토큰 무효화 — 항상 최신 링크 하나만 유효.
      await tx.verificationToken.updateMany({
        where: { userId: user.id, purpose: 'PASSWORD_RESET', consumedAt: null },
        data: { consumedAt: new Date() },
      });
      await tx.verificationToken.create({
        data: { purpose: 'PASSWORD_RESET', tokenHash, userId: user.id, expiresAt },
      });
    });

    const h = await headers();
    const origin = `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;
    await sendPasswordResetEmail(email, `${origin}/reset-password/${token}`);
  }

  return {
    ok: true,
    data: undefined,
    message: '해당 이메일로 가입된 계정이 있으면 재설정 안내를 보냈습니다.',
  };
}
