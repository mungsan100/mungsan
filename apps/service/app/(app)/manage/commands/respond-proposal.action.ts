'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

// 응답 액션이 만들 수 있는 상태만 허용(SUBMITTED/UNDER_REVIEW/IN_PROGRESS로의 임의 전이 차단).
const RESPONSES = {
  ACCEPTED: '제안을 수락했습니다.',
  REJECTED: '제안을 반려했습니다.',
  MEETING_REQUESTED: '미팅을 요청했습니다.',
} as const;

export type ProposalResponse = keyof typeof RESPONSES;

export type RespondProposalCommand = { proposalId: string; response: ProposalResponse };

// 받은 제안에 응답(수락/반려/미팅요청) — 공고 작성자만, 아직 응답 전(respondedAt null)일 때만.
// 사전조건을 where에 실은 updateMany로 중복 응답 레이스를 DB에서 닫는다.
export async function respondProposalAction(cmd: RespondProposalCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!(cmd.response in RESPONSES))
    return { ok: false, code: 'INVALID_RESPONSE', message: '허용되지 않는 응답입니다.' };

  const updated = await prisma.collaborationProposal.updateMany({
    where: { id: cmd.proposalId, respondedAt: null, post: { authorId: user.id } },
    data: { respondedAt: new Date(), status: cmd.response },
  });
  if (updated.count === 0)
    return { ok: false, code: 'NOT_RESPONDABLE', message: '이미 응답했거나 권한이 없는 제안입니다.' };

  revalidatePath('/manage');
  return { ok: true, data: undefined, message: RESPONSES[cmd.response] };
}
