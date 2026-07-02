import 'server-only';

import { prisma } from '@mungsan/db';

// 역량 선택용 카탈로그(통제 어휘) — 공고 작성 폼의 requiredSkillIds 칩 셀렉터가 이 실 데이터를 쓴다.
export type SkillOption = { id: string; name: string };

export async function getCollabSkillsQuery(): Promise<SkillOption[]> {
  return prisma.skill.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
}
