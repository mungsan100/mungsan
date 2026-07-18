'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

// 응답 액션이 만들 수 있는 상태만 허용(SUBMITTED/UNDER_REVIEW로의 임의 전이 차단).
const RESPONSES = {
  ACCEPTED: '제안을 수락했습니다. 협업 프로젝트가 생성됐어요.',
  REJECTED: '제안을 반려했습니다.',
  MEETING_REQUESTED: '미팅을 요청했습니다.',
} as const;

export type ProposalResponse = keyof typeof RESPONSES;

export type RespondProposalCommand = { proposalId: string; response: ProposalResponse };

// 받은 제안에 응답(수락/반려/미팅요청) — 공고 작성자만, 아직 응답 전(respondedAt null)일 때만.
// 사전조건을 where에 실은 updateMany로 중복 응답 레이스를 DB에서 닫는다.
// 수락은 곧바로 협업진행(IN_PROGRESS)으로 전이하고, 같은 트랜잭션에서 양측(공고 작성자·제안자)에
// 워크스페이스(Project)를 하나씩 만든다 — 참여 주체 모델이 아직 없어(project.prisma 헤더 참고)
// My 셰르파가 유저별 개인 공간이기 때문. 마일스톤은 할 일 첫 등록 때 "일반"으로 자동 확보된다.
export async function respondProposalAction(cmd: RespondProposalCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!(cmd.response in RESPONSES))
    return { ok: false, code: 'INVALID_RESPONSE', message: '허용되지 않는 응답입니다.' };

  if (cmd.response === 'ACCEPTED') {
    const transitioned = await prisma.$transaction(async (tx) => {
      const updated = await tx.collaborationProposal.updateMany({
        where: { id: cmd.proposalId, respondedAt: null, post: { authorId: user.id } },
        data: { respondedAt: new Date(), status: 'IN_PROGRESS' },
      });
      if (updated.count === 0) return false;

      const proposal = await tx.collaborationProposal.findUniqueOrThrow({
        where: { id: cmd.proposalId },
        select: { proposerId: true, post: { select: { title: true, authorId: true } } },
      });
      const title = `협업: ${proposal.post.title}`;
      await tx.project.createMany({
        data: [
          { title, userId: proposal.post.authorId },
          { title, userId: proposal.proposerId },
        ],
      });
      return true;
    });
    if (!transitioned)
      return { ok: false, code: 'NOT_RESPONDABLE', message: '이미 응답했거나 권한이 없는 제안입니다.' };

    revalidatePath('/manage');
    revalidatePath('/sherpa');
    revalidatePath('/');
    return { ok: true, data: undefined, message: RESPONSES.ACCEPTED };
  }

  const updated = await prisma.collaborationProposal.updateMany({
    where: { id: cmd.proposalId, respondedAt: null, post: { authorId: user.id } },
    data: { respondedAt: new Date(), status: cmd.response },
  });
  if (updated.count === 0)
    return { ok: false, code: 'NOT_RESPONDABLE', message: '이미 응답했거나 권한이 없는 제안입니다.' };

  revalidatePath('/manage');
  return { ok: true, data: undefined, message: RESPONSES[cmd.response] };
}
