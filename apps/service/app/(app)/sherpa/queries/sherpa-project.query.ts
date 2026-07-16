import 'server-only';

import { cache } from 'react';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

// 현재 유저의 primary 프로젝트 — 여러 개면 가장 최근(createdAt desc) 하나. 없으면 null.
export type SherpaProjectView = {
  id: string;
  title: string;
  description: string | null;
  progressPercentage: number;
  budgetInCheonwon: number | null;
  startDate: Date | null;
  endDate: Date | null;
};

// cache()로 요청 단위 메모이즈 — 배너·헤더·마일스톤·인사이트 섹션이 각자 호출해도 조회는 1회.
export const getSherpaProjectQuery = cache(async (): Promise<SherpaProjectView | null> => {
  const user = await getCurrentUser();

  return prisma.project.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      progressPercentage: true,
      budgetInCheonwon: true,
      startDate: true,
      endDate: true,
    },
  });
});
