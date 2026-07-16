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

  await ensureLoungeProfile(user.id);
  await prisma.loungeProfile.update({ where: { userId: user.id }, data: { nickname } });

  revalidatePath('/manage');
  revalidatePath('/lounge');
  return { ok: true, data: undefined, message: '닉네임을 변경했습니다.' };
}
