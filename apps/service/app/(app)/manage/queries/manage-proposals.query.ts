import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 내가 작성한 공고(post.authorId=현재 유저)가 받은 제안들. 상태는 DB의 ProposalStatus enum.
// canonical 값만 반환(Date·원시) — 상대시간·라벨 등 표시 변환은 ui가 담당.
export type ManageProposalView = {
  id: string;
  postId: string;
  postTitle: string;
  proposerCompanyName: string; // 제안자 회사명, 없으면 "회사 미등록"(실명 비노출)
  message: string;
  contributionRole: string | null;
  createdAt: Date;
  status: DB.ProposalStatus;
  respondable: boolean; // 아직 응답 전(수락/반려/미팅요청 가능)
  hasBrochure: boolean; // 제안자 회사 소개서 존재 여부(열람은 서명 URL 액션 경유)
};

export async function getManageProposalsQuery(userId: string): Promise<ManageProposalView[]> {
  const proposals = await prisma.collaborationProposal.findMany({
    // DRAFT(임시저장)는 제안자 본인만 보는 미제출 상태 — 받은 제안에서 제외.
    where: { post: { authorId: userId }, status: { not: 'DRAFT' } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      message: true,
      contributionRole: true,
      createdAt: true,
      status: true,
      respondedAt: true,
      postId: true,
      post: { select: { title: true } },
      proposer: { select: { company: { select: { id: true, name: true } } } },
    },
  });

  // 소개서 존재 여부 일괄 조회(N+1 방지) — Attachment는 무FK 폴리모픽이라 ownerId로 직접 조회.
  const companyIds = [
    ...new Set(proposals.map((p) => p.proposer.company?.id).filter((id): id is string => !!id)),
  ];
  const brochures = companyIds.length
    ? await prisma.attachment.findMany({
        where: { ownerType: 'COMPANY', ownerId: { in: companyIds }, kind: 'BROCHURE' },
        select: { ownerId: true },
      })
    : [];
  const hasBrochureByCompany = new Set(brochures.map((b) => b.ownerId));

  return proposals.map((p) => ({
    id: p.id,
    postId: p.postId,
    postTitle: p.post.title,
    proposerCompanyName: p.proposer.company?.name ?? '회사 미등록',
    message: p.message,
    contributionRole: p.contributionRole,
    createdAt: p.createdAt,
    status: p.status,
    respondable: p.respondedAt == null,
    hasBrochure: p.proposer.company ? hasBrochureByCompany.has(p.proposer.company.id) : false,
  }));
}
