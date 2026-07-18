import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 내 정보 마이페이지(PRD 우선순위 4) — 가입 시 입력한 개인정보 + 회사 정보 조회.
// canonical 값만 반환, 라벨은 ui가 담당.
export type MyInfoView = {
  name: string;
  phone: string;
  email: string; // 로그인 ID — 수정 불가(화면에 사유 표기)
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null;
  signedUpAt: Date;
  company: {
    name: string;
    businessRegistrationNo: string;
    industryName: string;
  } | null; // 회사 정보는 조회만(수정은 사업자등록증 재검증 이슈로 별도)
};

export async function getMyInfoQuery(userId: string): Promise<MyInfoView> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      phone: true,
      email: true,
      executiveRole: true,
      jobTitle: true,
      createdAt: true,
      company: {
        select: {
          name: true,
          businessRegistrationNo: true,
          industry: { select: { name: true } },
        },
      },
    },
  });

  return {
    name: user.name,
    phone: user.phone,
    email: user.email,
    executiveRole: user.executiveRole,
    jobTitle: user.jobTitle,
    signedUpAt: user.createdAt,
    company: user.company
      ? {
          name: user.company.name,
          businessRegistrationNo: user.company.businessRegistrationNo,
          industryName: user.company.industry.name,
        }
      : null,
  };
}
