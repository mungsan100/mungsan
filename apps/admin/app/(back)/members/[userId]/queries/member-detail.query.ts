import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

export type MemberDetail = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  suspendedAt: Date | null;
  withdrawnAt: Date | null;
  company: {
    name: string;
    businessRegistrationNo: string;
    industryName: string;
    region: string | null;
  } | null;
  activity: {
    loungePosts: number;
    loungeComments: number;
    collabPosts: number;
    sentProposals: number; // 제출된 것만(DRAFT 제외)
    reportedCount: number; // 이 회원 콘텐츠가 신고된 횟수(스냅샷 기준 대상자)
  };
};

export async function getMemberDetailQuery(userId: string): Promise<MemberDetail | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      executiveRole: true,
      jobTitle: true,
      createdAt: true,
      approvedAt: true,
      rejectedAt: true,
      suspendedAt: true,
      withdrawnAt: true,
      company: {
        select: {
          name: true,
          businessRegistrationNo: true,
          region: true,
          industry: { select: { name: true } },
        },
      },
    },
  });
  if (!user) return null;

  // 신고당한 횟수 — Report 는 폴리모픽(무FK)이라 이 회원 콘텐츠의 id 목록으로 집계한다.
  // 삭제·숨김된 콘텐츠에 대한 신고도 이력이므로 deletedAt 필터 없이 전체 id 를 모은다.
  const [myLoungePosts, myLoungeComments, myCollabPosts] = await Promise.all([
    prisma.loungePost.findMany({ where: { authorId: userId }, select: { id: true } }),
    prisma.loungeComment.findMany({ where: { authorId: userId }, select: { id: true } }),
    prisma.collaborationPost.findMany({ where: { authorId: userId }, select: { id: true } }),
  ]);

  const [loungePosts, loungeComments, collabPosts, sentProposals, reportedCount] =
    await Promise.all([
      prisma.loungePost.count({ where: { authorId: userId, deletedAt: null } }),
      prisma.loungeComment.count({ where: { authorId: userId, deletedAt: null } }),
      prisma.collaborationPost.count({ where: { authorId: userId, deletedAt: null } }),
      prisma.collaborationProposal.count({
        where: { proposerId: userId, status: { not: 'DRAFT' } },
      }),
      prisma.report.count({
        where: {
          OR: [
            { targetType: 'LOUNGE_POST', targetId: { in: myLoungePosts.map((p) => p.id) } },
            { targetType: 'LOUNGE_COMMENT', targetId: { in: myLoungeComments.map((c) => c.id) } },
            {
              targetType: 'COLLABORATION_POST',
              targetId: { in: myCollabPosts.map((p) => p.id) },
            },
          ],
        },
      }),
    ]);

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    executiveRole: user.executiveRole,
    jobTitle: user.jobTitle,
    createdAt: user.createdAt,
    approvedAt: user.approvedAt,
    rejectedAt: user.rejectedAt,
    suspendedAt: user.suspendedAt,
    withdrawnAt: user.withdrawnAt,
    company: user.company
      ? {
          name: user.company.name,
          businessRegistrationNo: user.company.businessRegistrationNo,
          industryName: user.company.industry.name,
          region: user.company.region,
        }
      : null,
    activity: { loungePosts, loungeComments, collabPosts, sentProposals, reportedCount },
  };
}
