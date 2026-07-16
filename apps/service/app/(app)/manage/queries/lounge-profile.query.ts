import 'server-only';

import { prisma } from '@mungsan/db';

import { ensureLoungeProfile } from '@/lib/lounge/ensure-lounge-profile';

export type LoungeProfileView = { nickname: string };

// 현재 유저의 라운지 닉네임 — 없으면 자동 가명으로 생성 후 반환.
export async function getLoungeProfileQuery(userId: string): Promise<LoungeProfileView> {
  await ensureLoungeProfile(userId);
  const profile = await prisma.loungeProfile.findUniqueOrThrow({
    where: { userId },
    select: { nickname: true },
  });
  return { nickname: profile.nickname };
}
