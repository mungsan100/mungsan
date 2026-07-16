'use server';

import { revalidatePath } from 'next/cache';
import { prisma, sortKeyBetween } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { recomputeProjectProgress } from '@/lib/sherpa/recompute-project-progress';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateTaskCommand = {
  projectId: string;
  milestoneId: string | null; // null이면 "일반" 마일스톤을 찾거나 생성해 귀속
  title: string;
  description: string | null;
  status: DB.TaskStatus;
  dueDate: Date | null;
};

const STATUS_VALUES: DB.TaskStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
const DEFAULT_MILESTONE_TITLE = '일반';

export async function createTaskAction(cmd: CreateTaskCommand): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();

  const title = cmd.title.trim();
  if (!title) return { ok: false, field: 'title', message: '업무 제목을 입력해 주세요.' };
  if (title.length > 120) return { ok: false, field: 'title', message: '업무 제목은 120자 이내로 입력해 주세요.' };
  if (!STATUS_VALUES.includes(cmd.status))
    return { ok: false, field: 'status', message: '올바른 상태를 선택해 주세요.' };
  const description = cmd.description?.trim() || null;

  // 인가 — 내 프로젝트에만 등록 가능
  const project = await prisma.project.findFirst({
    where: { id: cmd.projectId, userId: user.id },
    select: { id: true },
  });
  if (!project) return { ok: false, code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' };

  // 마일스톤 확정 — 지정값 검증 또는 "일반" 마일스톤 확보(Task.milestoneId가 필수라서)
  let milestoneId = cmd.milestoneId;
  if (milestoneId) {
    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, projectId: project.id },
      select: { id: true },
    });
    if (!milestone) return { ok: false, field: 'milestoneId', message: '마일스톤을 찾을 수 없습니다.' };
  } else {
    const fallback =
      (await prisma.milestone.findFirst({
        where: { projectId: project.id, title: DEFAULT_MILESTONE_TITLE },
        select: { id: true },
      })) ??
      (await prisma.milestone.create({
        data: { projectId: project.id, title: DEFAULT_MILESTONE_TITLE },
        select: { id: true },
      }));
    milestoneId = fallback.id;
  }

  // 정렬키 — 맨 뒤 추가
  const last = await prisma.task.findFirst({
    where: { projectId: project.id },
    orderBy: { sort: 'desc' },
    select: { sort: true },
  });
  const sortResult = sortKeyBetween(last?.sort ?? null, null);
  if (sortResult.isErr())
    return { ok: false, code: sortResult.error.code, message: '정렬키 생성에 실패했습니다.' };

  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.task.create({
      data: {
        projectId: project.id,
        milestoneId,
        title,
        description,
        status: cmd.status,
        dueDate: cmd.dueDate,
        completedAt: cmd.status === 'COMPLETED' ? new Date() : null,
        sort: sortResult.value,
      },
      select: { id: true },
    });
    await recomputeProjectProgress(tx, project.id);
    return row;
  });

  revalidatePath('/sherpa');
  revalidatePath('/');
  return { ok: true, data: { id: created.id }, message: '할 일을 등록했습니다.' };
}
