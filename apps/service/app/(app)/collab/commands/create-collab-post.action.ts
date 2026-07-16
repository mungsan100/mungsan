'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import { CollaborationPost } from '../domain/collaboration-post';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateCollabPostCommand = {
  title: string;
  description: string;
  minBudgetInCheonwon: number | null;
  maxBudgetInCheonwon: number | null;
  region: string | null;
  collaborationMethod: string | null;
  startDate: Date | null;
  endDate: Date | null;
  requiredSkillIds: string[];
  industryTagIds: string[];
  isPublic: boolean;
};

export async function createCollabPostAction(
  cmd: CreateCollabPostCommand,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser(); // 1. 인증

  // 2. 불변식 검증 (domain)
  const result = CollaborationPost.create({
    title: cmd.title,
    description: cmd.description,
    minBudgetInCheonwon: cmd.minBudgetInCheonwon,
    maxBudgetInCheonwon: cmd.maxBudgetInCheonwon,
    region: cmd.region,
    collaborationMethod: cmd.collaborationMethod,
    startDate: cmd.startDate,
    endDate: cmd.endDate,
    requiredSkillIds: cmd.requiredSkillIds,
    industryTagIds: cmd.industryTagIds,
  });
  if (result.isErr())
    return { ok: false, code: result.error.code, field: fieldOf(result.error.code), message: result.error.message };
  const post = result.value;

  // 3. 영속화 + 무효화. @default 유무와 무관하게 카운트 0을 명시한다(비즈니스 필드 명시 원칙).
  const created = await prisma.collaborationPost.create({
    data: {
      title: post.title,
      description: post.description,
      minBudgetInCheonwon: post.minBudgetInCheonwon,
      maxBudgetInCheonwon: post.maxBudgetInCheonwon,
      region: post.region,
      collaborationMethod: post.collaborationMethod,
      startDate: post.startDate,
      endDate: post.endDate,
      requiredSkillIds: post.requiredSkillIds,
      industryTagIds: post.industryTagIds,
      authorId: user.id,
      isPublic: cmd.isPublic,
      viewCount: 0,
      proposalCount: 0,
      bookmarkCount: 0,
    },
    select: { id: true },
  });

  revalidatePath('/collab');
  return { ok: true, data: { id: created.id }, message: '공고를 등록했습니다.' };
}

// 도메인 에러코드 → 폼 필드 매핑. 예산 오류는 최대 예산 입력에 표시(폼도 min<=max를 선검증).
function fieldOf(code: string): string | undefined {
  switch (code) {
    case 'TITLE_REQUIRED':
      return 'title';
    case 'DESCRIPTION_REQUIRED':
      return 'description';
    case 'BUDGET_NEGATIVE':
    case 'BUDGET_RANGE':
      return 'maxBudgetInCheonwon';
    default:
      return undefined;
  }
}
