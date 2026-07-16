'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { recomputeProjectProgress } from '@/lib/sherpa/recompute-project-progress';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ToggleTaskCompleteCommand = { taskId: string };

// 완료 체크박스 토글 — 완료가 아니면 COMPLETED로, 완료면 IN_PROGRESS로 되돌린다.
export async function toggleTaskCompleteAction(
  cmd: ToggleTaskCompleteCommand,
): Promise<ActionResult<{ completed: boolean }>> {
  const user = await getCurrentUser();

  const task = await prisma.task.findFirst({
    where: { id: cmd.taskId, project: { userId: user.id } },
    select: { id: true, projectId: true, status: true },
  });
  if (!task) return { ok: false, code: 'NOT_FOUND', message: '할 일을 찾을 수 없습니다.' };

  const completing = task.status !== 'COMPLETED';

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: task.id },
      data: {
        status: completing ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: completing ? new Date() : null,
      },
    });
    await recomputeProjectProgress(tx, task.projectId);
  });

  revalidatePath('/sherpa');
  revalidatePath('/');
  return {
    ok: true,
    data: { completed: completing },
    message: completing ? '완료 처리했습니다.' : '완료를 취소했습니다.',
  };
}
