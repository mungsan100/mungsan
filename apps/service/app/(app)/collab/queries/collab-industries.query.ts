import 'server-only';

import { prisma } from '@mungsan/db';

// 산업축 카테고리 탭의 원본 — Industry 카탈로그(통제 어휘). 탭 라벨은 이 실 데이터에서 온다.
export type IndustryOption = { id: string; name: string };

export async function getCollabIndustriesQuery(): Promise<IndustryOption[]> {
  return prisma.industry.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
}
