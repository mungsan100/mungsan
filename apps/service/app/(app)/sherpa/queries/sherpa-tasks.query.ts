import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { getSherpaProjectQuery } from './sherpa-project.query';

// primary 프로젝트의 할 일 목록 + 등록 폼용 마일스톤 옵션.
// canonical 값만 반환(Date·원시) — 표시 변환(D-day 등)은 ui가 담당.
export type SherpaTaskView = {
  id: string;
  title: string;
  description: string | null;
  status: DB.TaskStatus;
  dueDate: Date | null;
  milestoneId: string;
  milestoneTitle: string;
};

export type SherpaTasksView = {
  projectId: string;
  tasks: SherpaTaskView[];
  milestoneOptions: { id: string; title: string }[];
} | null;

export async function getSherpaTasksQuery(): Promise<SherpaTasksView> {
  const project = await getSherpaProjectQuery();
  if (!project) return null;

  const [tasks, milestones] = await Promise.all([
    prisma.task.findMany({
      where: { projectId: project.id },
      orderBy: { sort: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        milestoneId: true,
        milestone: { select: { title: true } },
      },
    }),
    prisma.milestone.findMany({
      where: { projectId: project.id },
      orderBy: [{ startDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
      select: { id: true, title: true },
    }),
  ]);

  return {
    projectId: project.id,
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.dueDate,
      milestoneId: t.milestoneId,
      milestoneTitle: t.milestone.title,
    })),
    milestoneOptions: milestones,
  };
}
