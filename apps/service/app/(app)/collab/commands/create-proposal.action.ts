'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { isDeadlinePassed } from '@/lib/collab/deadline';

import { composeProposalMessage, validateProposalFields, type ProposalFields } from '../domain/proposal-fields';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateProposalCommand = { postId: string } & ProposalFields;

// 제안 제출 — 구조화 5필드(자기소개/관심이유/기여역량/협업방식/미팅일정, PRD FR-CLBMK-3) + 역할.
// message 에는 필드를 합친 전문을 저장해 기존 화면(받은 제안 카드·스냅샷)과 호환한다.
// 같은 공고에 임시저장(DRAFT)이 있으면 삭제하고 새 SUBMITTED 로 제출한다(제출 시점 = createdAt).
export async function createProposalAction(cmd: CreateProposalCommand): Promise<ActionResult> {
  const user = await getCurrentUser(); // 1. 인증

  const validated = validateProposalFields(cmd, { requireCore: true });
  if (!validated.ok) return { ok: false, field: validated.field, message: validated.message };
  const fields = validated.fields;

  const post = await prisma.collaborationPost.findFirst({
    where: { id: cmd.postId, isPublic: true, deletedAt: null, hiddenAt: null },
    select: { id: true, authorId: true, applicationDeadline: true },
  }); // 2. 로드
  if (!post) return { ok: false, code: 'NOT_FOUND', message: '공고를 찾을 수 없습니다.' };

  // 3. 인가 — 본인 공고에는 제안 불가, 마감된 공고에는 새 제안 불가
  if (post.authorId === user.id)
    return { ok: false, code: 'OWN_POST', message: '내가 올린 공고에는 제안할 수 없습니다.' };
  if (isDeadlinePassed(post.applicationDeadline))
    return { ok: false, code: 'DEADLINE_PASSED', message: '마감된 공고에는 제안할 수 없습니다.' };

  // 4. 중복 제출 방지 — 이미 제출한(미DRAFT) 제안이 있으면 거부
  const existing = await prisma.collaborationProposal.findFirst({
    where: { postId: post.id, proposerId: user.id, status: { not: 'DRAFT' } },
    select: { id: true },
  });
  if (existing)
    return { ok: false, code: 'ALREADY_PROPOSED', message: '이미 이 공고에 제안을 보냈습니다.' };

  // 5. 영속화(임시저장 삭제 + 제안 생성 + 제안수 캐시 증가) + 무효화. status 명시(컨벤션).
  await prisma.$transaction(async (tx) => {
    await tx.collaborationProposal.deleteMany({
      where: { postId: post.id, proposerId: user.id, status: 'DRAFT' },
    });
    await tx.collaborationProposal.create({
      data: {
        postId: post.id,
        proposerId: user.id,
        message: composeProposalMessage(fields),
        ...fields,
        status: 'SUBMITTED',
      },
    });
    await tx.collaborationPost.update({
      where: { id: post.id },
      data: { proposalCount: { increment: 1 } },
    });
  });
  revalidatePath(`/collab/${post.id}`);
  revalidatePath('/collab');
  return { ok: true, data: undefined, message: '제안을 보냈습니다.' };
}
