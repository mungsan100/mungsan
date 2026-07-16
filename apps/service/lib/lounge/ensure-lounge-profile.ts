import 'server-only';

import { prisma } from '@mungsan/db';

// 라운지 활동 프로필이 없으면 생성한다. 닉네임은 실명과 무관한 자동 가명이다 —
// 실명을 기본값으로 쓰면 화면에 사실상 실명이 노출되는 것과 같다(가명↔실명 분리 원칙 위반).
// 이미 있으면 아무것도 바꾸지 않는다(사용자가 직접 정한 닉네임을 덮어쓰지 않음).
export async function ensureLoungeProfile(userId: string): Promise<void> {
  await prisma.loungeProfile.upsert({
    where: { userId },
    create: { userId, nickname: generateAnonymousNickname() },
    update: {},
  });
}

function generateAnonymousNickname(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `임원${suffix}`;
}
