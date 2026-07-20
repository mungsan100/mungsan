'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

// 회원 삭제(2026-07-20, 5-2) — 회원 탈퇴와 동일한 소프트 처리(withdrawnAt + 전 세션 파기)를
// 재사용한다. 하드 삭제를 쓰지 않는 이유: ① 글·댓글·제안·프로젝트가 FK 로 걸려 연쇄 삭제 시
// 커뮤니티 콘텐츠까지 소멸 ② 약관 동의 증적(UserConsent)도 사라져 분쟁 대응 불가.
// 효과는 즉시 로그인 차단·서비스 이용 불가로 동일하며, 오조작 시 withdrawnAt null 복원으로 되돌린다.
export async function deleteMemberAction(cmd: { userId: string }): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const removed = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id: cmd.userId, withdrawnAt: null, deletedAt: null },
      data: { withdrawnAt: new Date() },
    });
    if (updated.count === 0) return false;
    await tx.session.deleteMany({ where: { userId: cmd.userId } });
    return true;
  });
  if (!removed)
    return { ok: false, code: 'NOT_DELETABLE', message: '이미 삭제(탈퇴)됐거나 없는 회원입니다.' };

  revalidatePath('/members');
  return { ok: true, data: undefined, message: '회원을 삭제(비활성화)했습니다.' };
}
