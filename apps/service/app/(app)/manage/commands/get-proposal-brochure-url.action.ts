'use server';

import { prisma } from '@mungsan/db';
import { getSignedReadUrl } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type GetProposalBrochureUrlCommand = { proposalId: string };

// 제안자 회사 소개서의 시간제한 서명 URL 발급 — 그 제안을 받은 공고 작성자만.
// blob이 private-only 스토어라 열람은 항상 이 경로(서명 URL)를 거친다.
export async function getProposalBrochureUrlAction(
  cmd: GetProposalBrochureUrlCommand,
): Promise<ActionResult<{ url: string }>> {
  const user = await getCurrentUser();

  const proposal = await prisma.collaborationProposal.findFirst({
    where: { id: cmd.proposalId, post: { authorId: user.id } },
    select: { proposer: { select: { company: { select: { id: true } } } } },
  });
  if (!proposal) return { ok: false, code: 'NOT_FOUND', message: '제안을 찾을 수 없습니다.' };
  if (!proposal.proposer.company)
    return { ok: false, code: 'NO_COMPANY', message: '제안자의 회사 정보가 없습니다.' };

  const brochure = await prisma.attachment.findFirst({
    where: { ownerType: 'COMPANY', ownerId: proposal.proposer.company.id, kind: 'BROCHURE' },
    orderBy: { createdAt: 'desc' },
    select: { pathname: true },
  });
  if (!brochure) return { ok: false, code: 'NO_BROCHURE', message: '회사 소개서가 없습니다.' };

  const url = await getSignedReadUrl(brochure.pathname);
  return { ok: true, data: { url }, message: '소개서 링크를 발급했습니다.' };
}
