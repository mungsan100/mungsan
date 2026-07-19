'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ensureLoungeProfile } from '@/lib/lounge/ensure-lounge-profile';
import { formatKst } from '@/lib/datetime/format-kst';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type UpdateLoungeNicknameCommand = { nickname: string };

// 닉네임 변경 빈도 제한 — 한 달(30일)에 한 번. 자동 가명에서의 첫 변경은 제한 없음.
const CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export async function updateLoungeNicknameAction(
  cmd: UpdateLoungeNicknameCommand,
): Promise<ActionResult> {
  const user = await getCurrentUser();

  const nickname = cmd.nickname.trim();
  if (nickname.length < 2 || nickname.length > 20)
    return { ok: false, field: 'nickname', message: '닉네임은 2~20자로 입력해 주세요.' };

  await ensureLoungeProfile(user.id);
  const profile = await prisma.loungeProfile.findUniqueOrThrow({
    where: { userId: user.id },
    select: { nickname: true, nicknameChangedAt: true },
  });

  // 같은 값 재제출은 변경이 아니다 — 제한도 안 걸고 변경 시각도 안 갱신한다.
  if (profile.nickname === nickname)
    return { ok: true, data: undefined, message: '지금 사용 중인 닉네임입니다.' };

  // 30일 변경 제한 — 직접 변경 이력(nicknameChangedAt)이 있을 때만. 자동 가명 첫 변경은 자유.
  if (profile.nicknameChangedAt) {
    const nextChangeAt = new Date(profile.nicknameChangedAt.getTime() + CHANGE_COOLDOWN_MS);
    if (nextChangeAt > new Date())
      return {
        ok: false,
        field: 'nickname',
        message: `닉네임은 30일에 한 번만 바꿀 수 있어요. ${formatKst(nextChangeAt, 'M월 d일')}부터 변경할 수 있습니다.`,
      };
  }

  // 중복 방지 — 다른 회원이 같은 가명을 쓰면 라운지에서 발화 주체가 섞인다.
  // 대소문자만 다른 닉네임도 같은 가명으로 취급(insensitive — DB citext 유니크와 같은 규칙).
  // 사전 조회로 친절한 에러를 주고, 조회~저장 사이 레이스는 citext @unique(P2002)가 백스톱.
  const taken = await prisma.loungeProfile.findFirst({
    where: { nickname: { equals: nickname, mode: 'insensitive' }, userId: { not: user.id } },
    select: { id: true },
  });
  if (taken)
    return { ok: false, field: 'nickname', message: '이미 사용 중인 닉네임입니다.' };

  try {
    await prisma.loungeProfile.update({
      where: { userId: user.id },
      data: { nickname, nicknameChangedAt: new Date() },
    });
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
