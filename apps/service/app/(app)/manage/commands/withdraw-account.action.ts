'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@mungsan/db';

import { verifyPassword } from '@/lib/auth/password';
import { getSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type WithdrawAccountCommand = { password: string };

// 회원 탈퇴 — 완전 삭제가 아닌 비활성화(withdrawnAt 기록, 소프트). 복구는 운영자가
// withdrawnAt을 null로 되돌리면 된다. 오조작 방지를 위해 비밀번호 재확인을 요구한다.
// 탈퇴 후에는 로그인·세션 조회가 모두 차단된다(session.ts·login.action의 기존 withdrawnAt 검사).
// ※ 이메일이 @unique라 같은 주소로 재가입은 불가 — 복구 문의 안내가 필요한 이유.
export async function withdrawAccountAction(cmd: WithdrawAccountCommand): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, passwordHash: true },
  });
  if (!user?.passwordHash)
    return { ok: false, code: 'NOT_FOUND', message: '계정 정보를 찾을 수 없습니다.' };

  const valid = await verifyPassword(cmd.password, user.passwordHash);
  if (!valid)
    return { ok: false, field: 'password', message: '비밀번호가 올바르지 않습니다.' };

  // 사전조건(withdrawnAt null)을 where에 실어 중복 탈퇴 레이스를 DB에서 닫고,
  // 모든 기기의 세션을 한꺼번에 파기한다.
  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: { id: user.id, withdrawnAt: null },
      data: { withdrawnAt: new Date() },
    });
    await tx.session.deleteMany({ where: { userId: user.id } });
  });

  const cookieStore = await cookies();
  cookieStore.delete('mungsan_session');
  redirect('/login');
}
