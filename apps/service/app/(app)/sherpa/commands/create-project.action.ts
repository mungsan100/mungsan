'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateProjectCommand = { title: string };

// 수동 프로젝트 생성 — 협업 제안 경로가 실사용되기 전에도 할 일 기능을 쓸 수 있게 하는
// 최소 폼(제목만). 제안 수락 시 자동 생성되는 프로젝트와 동일한 모델을 쓴다.
// 마일스톤은 할 일 첫 등록 때 "일반"으로 자동 확보된다(create-task.action 참고).
export async function createProjectAction(
  cmd: CreateProjectCommand,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();

  const title = cmd.title.trim();
  if (!title) return { ok: false, field: 'title', message: '프로젝트 이름을 입력해 주세요.' };
  if (title.length > 80)
    return { ok: false, field: 'title', message: '프로젝트 이름은 80자 이내로 입력해 주세요.' };

  const created = await prisma.project.create({
    data: { title, userId: user.id },
    select: { id: true },
  });

  revalidatePath('/sherpa');
  revalidatePath('/');
  return { ok: true, data: { id: created.id }, message: '프로젝트를 만들었습니다.' };
}
