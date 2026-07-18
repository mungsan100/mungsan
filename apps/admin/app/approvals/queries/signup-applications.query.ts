import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 가입 신청(기업정보 제출 완료) 건 목록. canonical 값만 반환(Date·원시) — 라벨·포맷 등
// 표시 변환은 ui 가 담당. 상태는 User 의 시각 presence(approvedAt/rejectedAt)에서 파생한다.
export type SignupApplicationView = {
  userId: string;
  applicantName: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null;
  companyName: string;
  businessRegistrationNo: string;
  industryName: string;
  appliedAt: Date; // 기업정보 제출 시각(Company.createdAt) = 심사 시작 시점
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt: Date | null; // 승인/반려 처리 시각
};

// pending: 심사 대기(기업정보는 냈고 승인도 반려도 안 된 건), 오래 기다린 순.
// decided: 승인/반려 처리 완료 건, 최근 처리 순(처리 시 updatedAt 갱신) 최대 50건.
export async function getSignupApplicationsQuery(
  mode: 'pending' | 'decided',
): Promise<SignupApplicationView[]> {
  const reviewable = { deletedAt: null, withdrawnAt: null, company: { isNot: null } };

  const users = await prisma.user.findMany({
    where:
      mode === 'pending'
        ? { ...reviewable, approvedAt: null, rejectedAt: null }
        : { ...reviewable, OR: [{ approvedAt: { not: null } }, { rejectedAt: { not: null } }] },
    orderBy: mode === 'pending' ? { company: { createdAt: 'asc' } } : { updatedAt: 'desc' },
    ...(mode === 'decided' && { take: 50 }),
    select: {
      id: true,
      name: true,
      executiveRole: true,
      jobTitle: true,
      approvedAt: true,
      rejectedAt: true,
      company: {
        select: {
          name: true,
          businessRegistrationNo: true,
          createdAt: true,
          industry: { select: { name: true } },
        },
      },
    },
  });

  return users.flatMap((user) => {
    if (!user.company) return []; // where 가 보장하지만 타입상 nullable — 방어적으로 제외
    return [
      {
        userId: user.id,
        applicantName: user.name,
        executiveRole: user.executiveRole,
        jobTitle: user.jobTitle,
        companyName: user.company.name,
        businessRegistrationNo: user.company.businessRegistrationNo,
        industryName: user.company.industry.name,
        appliedAt: user.company.createdAt,
        status: user.approvedAt ? 'APPROVED' : user.rejectedAt ? 'REJECTED' : 'PENDING',
        decidedAt: user.approvedAt ?? user.rejectedAt,
      } satisfies SignupApplicationView,
    ];
  });
}
