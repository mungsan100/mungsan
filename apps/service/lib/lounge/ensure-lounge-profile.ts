import 'server-only';

import { prisma } from '@mungsan/db';

// 라운지 활동 프로필이 없으면 생성한다. 닉네임은 실명과 무관한 자동 가명이다 —
// 실명을 기본값으로 쓰면 화면에 사실상 실명이 노출되는 것과 같다(가명↔실명 분리 원칙 위반).
// 이미 있으면 아무것도 바꾸지 않는다(사용자가 직접 정한 닉네임을 덮어쓰지 않음).
// 닉네임은 중복 금지라 자동 가명("임원NNNN")도 사용 중이면 다른 번호로 재추첨한다.
export async function ensureLoungeProfile(userId: string): Promise<void> {
  const existing = await prisma.loungeProfile.findUnique({ where: { userId }, select: { id: true } });
  if (existing) return;

  for (let attempt = 0; attempt < 5; attempt++) {
    const nickname = generateAnonymousNickname();
    const taken = await prisma.loungeProfile.findFirst({ where: { nickname }, select: { id: true } });
    if (taken) continue;
    try {
      await prisma.loungeProfile.create({ data: { userId, nickname } });
      return;
    } catch (err) {
      // 동시 요청 레이스: userId 중복(이미 만들어짐)이면 완료, nickname 충돌이면 재추첨.
      if (!isUniqueViolation(err)) throw err;
      const nowExists = await prisma.loungeProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (nowExists) return;
    }
  }
  // 4자리 재추첨 5회가 전부 충돌할 규모면 자릿수를 늘릴 때다 — 조용한 무한루프 대신 명시적 실패.
  throw new Error('라운지 가명 자동 생성에 실패했습니다.');
}

function generateAnonymousNickname(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `임원${suffix}`;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2002'
  );
}
