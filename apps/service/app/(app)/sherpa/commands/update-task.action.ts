'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { recomputeProjectProgress } from '@/lib/sherpa/recompute-project-progress';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type UpdateTaskCommand = {
  taskId: string;
  title: string;
  description: string | null;
  status: DB.TaskStatus;
  dueDate: Date | null;
};

const STATUS_VALUES: DB.TaskStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

export async function updateTaskAction(cmd: UpdateTaskCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  const title = cmd.title.trim();
  if (!title) return { ok: false, field: 'title', message: '업무 제목을 입력해 주세요.' };
  if (title.length > 120) return { ok: false, field: 'title', message: '업무 제목은 120자 이내로 입력해 주세요.' };
  if (!STATUS_VALUES.includes(cmd.status))
    return { ok: false, field: 'status', message: '올바른 상태를 선택해 주세요.' };
  const description = cmd.description?.trim() || null;

  // 인가 — 내 프로젝트의 할 일만. completedAt은 상태 전이에 맞춰 기록/해제.
  const task = await prisma.task.findFirst({
    where: { id: cmd.taskId, project: { userId: user.id } },
    select: { id: true, projectId: true, status: true, completedAt: true },
  });
  if (!task) return { ok: false, code: 'NOT_FOUND', message: '할 일을 찾을 수 없습니다.' };

  const completedAt =
    cmd.status === 'COMPLETED' ? (task.completedAt ?? new Date()) : null;

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: task.id },
      data: { title, description, status: cmd.status, dueDate: cmd.dueDate, completedAt },
    });
    await recomputeProjectProgress(tx, task.projectId);
  });

  revalidatePath('/sherpa');
  revalidatePath('/');
  return { ok: true, data: undefined, message: '할 일을 수정했습니다.' };
}
