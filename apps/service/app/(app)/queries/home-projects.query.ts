import 'server-only';

import { prisma } from '@mungsan/db';

export type HomeProject = {
  id: string;
  title: string;
  description: string | null;
  progressPercentage: number;
  endDate: Date | null;
};

export async function getHomeProjectsQuery(userId: string): Promise<HomeProject[]> {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, description: true, progressPercentage: true, endDate: true },
  });
}
