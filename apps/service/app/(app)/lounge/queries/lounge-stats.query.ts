import 'server-only';

import { prisma } from '@mungsan/db';

// 활동 중(이용가능) 회원 수 — 라운지 헤더 카운트. 상태는 시각 presence로 표현되므로(user.prisma),
// 승인(approvedAt) 됐고 정지·탈퇴·삭제가 아닌 회원만 집계한다.
export async function getLoungeMemberCountQuery(): Promise<number> {
  return prisma.user.count({
    where: {
      approvedAt: { not: null },
      deletedAt: null,
      suspendedAt: null,
      withdrawnAt: null,
    },
  });
}
