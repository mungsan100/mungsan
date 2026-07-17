'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type MarkProposalViewedCommand = { proposalId: string };

// 제안 열람 처리 — 현재 유저가 그 공고 작성자이고 아직 미열람일 때만 열람 시각을 찍고,
// 상태도 제안완료(SUBMITTED) → 검토중(UNDER_REVIEW)으로 전이한다.
// 사전조건을 where에 실은 updateMany로 레이스(동시 열람)를 DB에서 닫는다.
export async function markProposalViewedAction(
  cmd: MarkProposalViewedCommand,
): Promise<ActionResult> {
  const user = await getCurrentUser();

  await prisma.collaborationProposal.updateMany({
    where: { id: cmd.proposalId, viewedAt: null, post: { authorId: user.id } },
    data: { viewedAt: new Date(), status: 'UNDER_REVIEW' },
  });

  revalidatePath('/manage');
  return { ok: true, data: undefined, message: '제안을 열람했습니다.' };
}
