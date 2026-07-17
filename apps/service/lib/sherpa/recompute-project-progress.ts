import 'server-only';

import type { DB } from '@mungsan/db';

// Task 변경 후 Project.progressPercentage(비정규화 스냅샷)를 재계산한다 — 완료/전체 비율.
// 쓰기 경로(command)가 자기 트랜잭션 안에서 호출한다(project.prisma 주석의 "Task 기반 갱신").
export async function recomputeProjectProgress(
  tx: Pick<DB.Prisma.TransactionClient, 'task' | 'project'>,
  projectId: string,
): Promise<void> {
  const [total, completed] = await Promise.all([
    tx.task.count({ where: { projectId } }),
    tx.task.count({ where: { projectId, status: 'COMPLETED' } }),
  ]);
  const progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  await tx.project.update({ where: { id: projectId }, data: { progressPercentage } });
}
