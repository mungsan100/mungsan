import 'server-only';

import { prisma } from '@mungsan/db';

import { getSherpaProjectQuery } from './sherpa-project.query';

// 마일스톤 status는 canonical enum이 아니라 UI 소비 전용 파생 union이다.
export type SherpaMilestoneStatus = 'done' | 'active' | 'upcoming';

export type SherpaMilestoneView = {
  id: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  status: SherpaMilestoneStatus;
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
};

export async function getSherpaMilestonesQuery(): Promise<SherpaMilestoneView[]> {
  const project = await getSherpaProjectQuery();
  if (!project) return [];

  const milestones = await prisma.milestone.findMany({
    where: { projectId: project.id },
    orderBy: [{ startDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      tasks: { select: { status: true, dueDate: true } },
    },
  });

  // now는 상태·지연 파생에만 쓰고 where에 넣지 않으므로, 조회를 먼저 await한 뒤 읽어
  // cacheComponents 동적 규칙을 충족한다(uncached 접근 이후 시각 허용).
  const now = new Date();

  return milestones.map((m) => {
    const totalTasks = m.tasks.length;
    const doneTasks = m.tasks.filter((t) => t.status === 'COMPLETED').length;
    const overdueTasks = m.tasks.filter(
      (t) => t.dueDate != null && t.dueDate < now && t.status !== 'COMPLETED',
    ).length;

    return {
      id: m.id,
      title: m.title,
      startDate: m.startDate,
      endDate: m.endDate,
      status: deriveStatus(m.startDate, m.endDate, m.tasks, now, totalTasks, doneTasks),
      totalTasks,
      doneTasks,
      overdueTasks,
    };
  });
}

type TaskRollup = { status: string; dueDate: Date | null };

function deriveStatus(
  startDate: Date | null,
  endDate: Date | null,
  tasks: TaskRollup[],
  now: Date,
  totalTasks: number,
  doneTasks: number,
): SherpaMilestoneStatus {
  // done: 할 일이 모두 완료됐거나, 종료일이 지났고 남은 할 일이 없음(빈 마일스톤 포함).
  const isDone =
    (totalTasks > 0 && doneTasks === totalTasks) ||
    (endDate != null && endDate < now && doneTasks === totalTasks);
  if (isDone) return 'done';

  // active: 진행중 할 일이 있거나, 지금이 시작~종료 구간 안.
  const hasInProgress = tasks.some((t) => t.status === 'IN_PROGRESS');
  const inRange = startDate != null && endDate != null && startDate <= now && now <= endDate;
  if (hasInProgress || inRange) return 'active';

  return 'upcoming';
}
