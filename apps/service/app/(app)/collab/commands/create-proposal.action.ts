'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { isDeadlinePassed } from '@/lib/collab/deadline';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateProposalCommand = {
  postId: string;
  message: string;
  contributionRole?: string;
};

export async function createProposalAction(cmd: CreateProposalCommand): Promise<ActionResult> {
  const user = await getCurrentUser(); // 1. 인증

  const message = cmd.message?.trim() ?? '';
  if (message.length < 10)
    return { ok: false, field: 'message', message: '제안 메시지를 10자 이상 입력해주세요.' };
  const contributionRole = cmd.contributionRole?.trim() || null;

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

  // 4. 영속화(제안 생성 + 제안수 캐시 증가) + 무효화. status는 명시(컨벤션 — default 없음).
  await prisma.$transaction([
    prisma.collaborationProposal.create({
      data: { postId: post.id, proposerId: user.id, message, contributionRole, status: 'SUBMITTED' },
    }),
    prisma.collaborationPost.update({
      where: { id: post.id },
      data: { proposalCount: { increment: 1 } },
    }),
  ]);
  revalidatePath(`/collab/${post.id}`);
  revalidatePath('/collab');
  return { ok: true, data: undefined, message: '제안을 보냈습니다.' };
}
