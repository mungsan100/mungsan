import 'server-only';

import { prisma } from '@mungsan/db';
import { computeTrustScore, type TrustScore } from '@mungsan/trust';

// admin 회원 상세용 신뢰 지수 — service(lib/trust/trust-score.query.ts)와 동일 신호를 모아
// 동일 공식(@mungsan/trust)으로 계산한다. 두 앱이 같은 점수를 내도록 신호 수집 로직을 일치시킨다.
export async function getMemberTrustScoreQuery(userId: string): Promise<TrustScore> {
  const [
    company,
    loungePosts,
    loungeComments,
    sentProposals,
    collabPosts,
    receivedProposals,
    respondedProposals,
    projectCount,
  ] = await Promise.all([
    prisma.company.findUnique({
      where: { userId },
      select: {
        description: true,
        trackRecord: true,
        website: true,
        revenueInCheonwon: true,
        capabilityIds: true,
        region: true,
        headcount: true,
        foundedDate: true,
      },
    }),
    prisma.loungePost.count({ where: { authorId: userId, deletedAt: null } }),
    prisma.loungeComment.count({ where: { authorId: userId, deletedAt: null } }),
    // 임시저장(DRAFT)은 미제출이라 활동도, 응답 대상도 아니다 — 보낸/받은 제안 집계에서 제외.
    prisma.collaborationProposal.count({
      where: { proposerId: userId, status: { not: 'DRAFT' } },
    }),
    prisma.collaborationPost.count({ where: { authorId: userId, deletedAt: null } }),
    prisma.collaborationProposal.count({
      where: { post: { authorId: userId }, status: { not: 'DRAFT' } },
    }),
    prisma.collaborationProposal.count({
      where: { post: { authorId: userId }, respondedAt: { not: null } },
    }),
    prisma.project.count({ where: { userId } }),
  ]);

  // 회사 프로필 완성도 — 8개 선택 항목 중 채워진 수(service와 동일 항목).
  const companyFieldsTotal = 8;
  const companyFieldsFilled = company
    ? [
        company.description,
        company.trackRecord,
        company.website,
        company.revenueInCheonwon,
        company.region,
        company.headcount,
        company.foundedDate,
        company.capabilityIds.length > 0 ? 'filled' : null,
      ].filter((f) => f != null).length
    : 0;

  return computeTrustScore({
    companyFieldsFilled,
    companyFieldsTotal,
    activityCount: loungePosts + loungeComments + sentProposals + collabPosts,
    receivedProposals,
    respondedProposals,
    projectCount,
  });
}
