'use server';

import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { isDeadlinePassed } from '@/lib/collab/deadline';

import { composeProposalMessage, validateProposalFields, type ProposalFields } from '../domain/proposal-fields';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type SaveProposalDraftCommand = { postId: string } & Partial<ProposalFields>;

// 제안 임시저장 — 공고당 1건의 DRAFT 를 유지(있으면 갱신). 공고 작성자에게 보이지 않고
// proposalCount 에도 잡히지 않는다. 제출 시 create-proposal 이 DRAFT 를 지우고 새로 만든다.
export async function saveProposalDraftAction(
  cmd: SaveProposalDraftCommand,
): Promise<ActionResult> {
  const user = await getCurrentUser();

  const validated = validateProposalFields(cmd, { requireCore: false });
  if (!validated.ok) return { ok: false, field: validated.field, message: validated.message };
  const fields = validated.fields;

  const post = await prisma.collaborationPost.findFirst({
    where: { id: cmd.postId, isPublic: true, deletedAt: null, hiddenAt: null },
    select: { id: true, authorId: true, applicationDeadline: true },
  });
  if (!post) return { ok: false, code: 'NOT_FOUND', message: '공고를 찾을 수 없습니다.' };
  if (post.authorId === user.id)
    return { ok: false, code: 'OWN_POST', message: '내가 올린 공고에는 제안할 수 없습니다.' };
  if (isDeadlinePassed(post.applicationDeadline))
    return { ok: false, code: 'DEADLINE_PASSED', message: '마감된 공고입니다.' };

  const data = { message: composeProposalMessage(fields), ...fields };
  const draft = await prisma.collaborationProposal.findFirst({
    where: { postId: post.id, proposerId: user.id, status: 'DRAFT' },
    select: { id: true },
  });
  if (draft) {
    await prisma.collaborationProposal.update({ where: { id: draft.id }, data });
  } else {
    await prisma.collaborationProposal.create({
      data: { postId: post.id, proposerId: user.id, status: 'DRAFT', ...data },
    });
  }

  return { ok: true, data: undefined, message: '임시 저장했습니다. 이 화면에 다시 오면 이어서 작성할 수 있어요.' };
}
