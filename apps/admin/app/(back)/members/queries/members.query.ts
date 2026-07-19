import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 회원 상태 필터 — User 의 "시각 presence" 상태 모델(user.prisma 헤더)에서 파생.
// active: 승인됐고 정지·탈퇴 아님 / suspended: 정지 / withdrawn: 탈퇴 / all: 전체(소프트삭제 제외).
export type MemberStatusFilter = 'all' | 'active' | 'suspended' | 'withdrawn';

export type MemberListItem = {
  userId: string;
  name: string;
  email: string;
  companyName: string | null;
  industryName: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  suspendedAt: Date | null;
  withdrawnAt: Date | null;
};

const LIST_TAKE = 100;

const STATUS_WHERE: Record<MemberStatusFilter, DB.Prisma.UserWhereInput> = {
  all: {},
  active: { approvedAt: { not: null }, suspendedAt: null, withdrawnAt: null },
  suspended: { suspendedAt: { not: null } },
  withdrawn: { withdrawnAt: { not: null } },
};

export async function getMembersQuery(
  status: MemberStatusFilter,
  q?: string,
): Promise<MemberListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...STATUS_WHERE[status],
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { company: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: LIST_TAKE,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      approvedAt: true,
      suspendedAt: true,
      withdrawnAt: true,
      company: { select: { name: true, industry: { select: { name: true } } } },
    },
  });

  return users.map((user) => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    companyName: user.company?.name ?? null,
    industryName: user.company?.industry.name ?? null,
    createdAt: user.createdAt,
    approvedAt: user.approvedAt,
    suspendedAt: user.suspendedAt,
    withdrawnAt: user.withdrawnAt,
  }));
}

// 상태별 건수 — 탭 라벨에 표시(소프트삭제 제외 모집단).
export async function getMemberStatusCountsQuery(): Promise<Record<MemberStatusFilter, number>> {
  const [all, active, suspended, withdrawn] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, ...STATUS_WHERE.active } }),
    prisma.user.count({ where: { deletedAt: null, ...STATUS_WHERE.suspended } }),
    prisma.user.count({ where: { deletedAt: null, ...STATUS_WHERE.withdrawn } }),
  ]);
  return { all, active, suspended, withdrawn };
}
