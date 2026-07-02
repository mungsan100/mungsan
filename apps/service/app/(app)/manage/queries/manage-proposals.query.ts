import 'server-only';

import { prisma } from '@mungsan/db';

// 내가 작성한 공고(post.authorId=현재 유저)가 받은 제안들. 상태는 열람/응답 시각에서 파생한다.
// canonical 값만 반환(Date·원시) — 상대시간·라벨 등 표시 변환은 ui가 담당.
export type ProposalStatus = 'unread' | 'viewed' | 'replied';

export type ManageProposalView = {
  id: string;
  postId: string;
  postTitle: string;
  proposerCompanyName: string; // 제안자 회사명, 없으면 이름
  message: string;
  createdAt: Date;
  status: ProposalStatus;
};

export async function getManageProposalsQuery(userId: string): Promise<ManageProposalView[]> {
  const proposals = await prisma.collaborationProposal.findMany({
    where: { post: { authorId: userId } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      message: true,
      createdAt: true,
      viewedAt: true,
      respondedAt: true,
      postId: true,
      post: { select: { title: true } },
      proposer: { select: { name: true, company: { select: { name: true } } } },
    },
  });

  return proposals.map((p) => ({
    id: p.id,
    postId: p.postId,
    postTitle: p.post.title,
    proposerCompanyName: p.proposer.company?.name ?? p.proposer.name,
    message: p.message,
    createdAt: p.createdAt,
    status: p.respondedAt != null ? 'replied' : p.viewedAt != null ? 'viewed' : 'unread',
  }));
}
