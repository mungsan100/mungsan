'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { recomputeProjectProgress } from '@/lib/sherpa/recompute-project-progress';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type DeleteTaskCommand = { taskId: string };

// 할 일 삭제 — Task엔 deletedAt이 없어 하드 삭제(스키마 컨벤션상 Task는 소프트삭제 비대상).
export async function deleteTaskAction(cmd: DeleteTaskCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  const task = await prisma.task.findFirst({
    where: { id: cmd.taskId, project: { userId: user.id } },
    select: { id: true, projectId: true },
  });
  if (!task) return { ok: false, code: 'NOT_FOUND', message: '할 일을 찾을 수 없습니다.' };

  await prisma.$transaction(async (tx) => {
    await tx.task.delete({ where: { id: task.id } });
    await recomputeProjectProgress(tx, task.projectId);
  });

  revalidatePath('/sherpa');
  revalidatePath('/');
  return { ok: true, data: undefined, message: '할 일을 삭제했습니다.' };
}
