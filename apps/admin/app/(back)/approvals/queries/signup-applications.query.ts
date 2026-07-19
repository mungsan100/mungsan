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
  isRereview: boolean; // 회사 정보 수정 이력 보유 — 신규 가입이 아닌 재심사 건
  lastRevisedAt: Date | null; // 마지막 수정 시각(재심사 대기 정렬·표시용)
};

// 목록/업종 집계가 같은 모집단을 보도록 모드별 where 를 공유한다.
function modeWhere(mode: 'pending' | 'decided') {
  const reviewable = { deletedAt: null, withdrawnAt: null, company: { isNot: null } };
  return mode === 'pending'
    ? { ...reviewable, approvedAt: null, rejectedAt: null }
    : { ...reviewable, OR: [{ approvedAt: { not: null } }, { rejectedAt: { not: null } }] };
}

// pending: 심사 대기(기업정보는 냈고 승인도 반려도 안 된 건), 오래 기다린 순.
// decided: 승인/반려 처리 완료 건, 최근 처리 순(처리 시 updatedAt 갱신) 최대 50건.
// industryName: 업종 칩 필터(업종명은 unique) — 없으면 전체.
export async function getSignupApplicationsQuery(
  mode: 'pending' | 'decided',
  industryName?: string,
): Promise<SignupApplicationView[]> {
  const users = await prisma.user.findMany({
    where: {
      ...modeWhere(mode),
      ...(industryName ? { company: { is: { industry: { name: industryName } } } } : {}),
    },
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
          // 수정 이력 최신 1건 — 있으면 재심사 건(회사 정보 수정으로 승인이 되돌려진 경우)
          revisions: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
        },
      },
    },
  });

  return users.flatMap((user) => {
    if (!user.company) return []; // where 가 보장하지만 타입상 nullable — 방어적으로 제외
    const lastRevision = user.company.revisions[0] ?? null;
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
        isRereview: lastRevision != null,
        lastRevisedAt: lastRevision?.createdAt ?? null,
      } satisfies SignupApplicationView,
    ];
  });
}

// 업종별 신청 건수(회원 분류 관리) — 현재 탭과 같은 모집단 기준, 건수 많은 순.
// decided 목록의 take 50 캡과 달리 전체 기준 집계(분류 파악 목적이라 캡 없이 정확하게).
export type IndustryFacetView = { name: string; count: number };

export async function getApplicationIndustryFacetsQuery(
  mode: 'pending' | 'decided',
): Promise<IndustryFacetView[]> {
  const users = await prisma.user.findMany({
    where: modeWhere(mode),
    select: { company: { select: { industry: { select: { name: true } } } } },
  });

  const counts = new Map<string, number>();
  for (const user of users) {
    const name = user.company?.industry.name;
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));
}
