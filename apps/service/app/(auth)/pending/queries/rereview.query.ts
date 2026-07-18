import 'server-only';

import { prisma } from '@mungsan/db';

// 재심사 여부 — CompanyRevision 은 회사 정보 수정(재심사 전환)에서만 생기므로,
// 미승인·미반려 상태에서 이력이 있으면 "정보 수정으로 인한 재심사"로 판정할 수 있다.
export async function isRereviewQuery(userId: string): Promise<boolean> {
  const revision = await prisma.companyRevision.findFirst({
    where: { company: { userId } },
    select: { id: true },
  });
  return revision != null;
}
