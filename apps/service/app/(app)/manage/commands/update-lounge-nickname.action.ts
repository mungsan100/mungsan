'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ensureLoungeProfile } from '@/lib/lounge/ensure-lounge-profile';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type UpdateLoungeNicknameCommand = { nickname: string };

export async function updateLoungeNicknameAction(
  cmd: UpdateLoungeNicknameCommand,
): Promise<ActionResult> {
  const user = await getCurrentUser();

  const nickname = cmd.nickname.trim();
  if (nickname.length < 2 || nickname.length > 20)
    return { ok: false, field: 'nickname', message: '닉네임은 2~20자로 입력해 주세요.' };

  // 중복 방지 — 다른 회원이 같은 가명을 쓰면 라운지에서 발화 주체가 섞인다.
  // 사전 조회로 친절한 에러를 주고, 조회~저장 사이 레이스는 nickname @unique(P2002)가 백스톱.
  const taken = await prisma.loungeProfile.findFirst({
    where: { nickname, userId: { not: user.id } },
    select: { id: true },
  });
  if (taken)
    return { ok: false, field: 'nickname', message: '이미 사용 중인 닉네임입니다.' };

  await ensureLoungeProfile(user.id);
  try {
    await prisma.loungeProfile.update({ where: { userId: user.id }, data: { nickname } });
  } catch (err) {
    if (isUniqueViolation(err))
      return { ok: false, field: 'nickname', message: '이미 사용 중인 닉네임입니다.' };
    throw err;
  }

  revalidatePath('/manage');
  revalidatePath('/lounge');
  return { ok: true, data: undefined, message: '닉네임을 변경했습니다.' };
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2002'
  );
}
