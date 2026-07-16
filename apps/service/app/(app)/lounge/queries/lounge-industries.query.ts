import 'server-only';

import { prisma } from '@mungsan/db';

// 카테고리 탭(산업축)을 채우는 업종 카탈로그. 라운지 피드는 이 업종명으로 작성자 회사를 필터한다.
export async function getLoungeIndustriesQuery(): Promise<string[]> {
  const industries = await prisma.industry.findMany({
    orderBy: { createdAt: 'asc' },
    select: { name: true },
  });
  return industries.map((i) => i.name);
}
