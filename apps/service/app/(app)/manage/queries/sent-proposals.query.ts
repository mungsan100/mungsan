import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 내가 보낸 제안 목록(PRD 잔여 — 보낸 제안 상태 확인). DRAFT(임시저장)는 제외 —
// 그건 해당 공고 상세의 제안 폼에서 복원된다. canonical 값만 반환, 라벨은 ui가 담당.
export type SentProposalView = {
  id: string;
  postId: string;
  postTitle: string;
  postCompanyName: string; // 공고 작성 기업(없으면 작성자 이름)
  status: DB.ProposalStatus;
  createdAt: Date;
  respondedAt: Date | null;
};

export async function getSentProposalsQuery(userId: string): Promise<SentProposalView[]> {
  const proposals = await prisma.collaborationProposal.findMany({
    where: { proposerId: userId, status: { not: 'DRAFT' } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      respondedAt: true,
      postId: true,
      post: {
        select: {
          title: true,
          author: { select: { name: true, company: { select: { name: true } } } },
        },
      },
    },
  });

  return proposals.map((proposal) => ({
    id: proposal.id,
    postId: proposal.postId,
    postTitle: proposal.post.title,
    postCompanyName: proposal.post.author.company?.name ?? proposal.post.author.name,
    status: proposal.status,
    createdAt: proposal.createdAt,
    respondedAt: proposal.respondedAt,
  }));
}
