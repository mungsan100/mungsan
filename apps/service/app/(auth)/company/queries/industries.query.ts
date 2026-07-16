import 'server-only';

import { prisma } from '@mungsan/db';

// 업종 select 옵션 — Industry 카탈로그(통제 어휘).
export type IndustryOption = { id: string; name: string };

export async function getIndustriesQuery(): Promise<IndustryOption[]> {
  return prisma.industry.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
}
