import 'server-only';

import { cache } from 'react';
import { prisma } from '@mungsan/db';

import { computeTrustScore } from './compute-trust-score';

export type { TrustScore, TrustMetric } from './compute-trust-score';

// 사용자의 신뢰지수 — 실제 신호를 모아 순수 계산기(computeTrustScore)에 넘긴다.
// 요청 단위 메모이즈 — 한 요청의 홈/관리 여러 섹션이 호출해도 조회는 1회.
export const getTrustScoreQuery = cache(async (userId: string) => {
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

  // 회사 프로필 완성도 — 8개 선택 항목 중 채워진 수.
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
});
