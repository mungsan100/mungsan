import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 다가오는 할 일 — 내 프로젝트의 미완료 Task를 마감 임박순으로. 마감일 없는 건 뒤로.
export type HomeTask = {
  id: string;
  title: string;
  status: DB.TaskStatus;
  dueDate: Date | null;
  updatedAt: Date;
  projectTitle: string;
};

export async function getHomeTasksQuery(userId: string): Promise<HomeTask[]> {
  const tasks = await prisma.task.findMany({
    where: { project: { userId }, status: { not: 'COMPLETED' } },
    orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { updatedAt: 'desc' }],
    take: 3,
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      updatedAt: true,
      project: { select: { title: true } },
    },
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    dueDate: t.dueDate,
    updatedAt: t.updatedAt,
    projectTitle: t.project.title,
  }));
}
