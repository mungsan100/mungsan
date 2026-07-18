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
    industryId: string; // 수정 폼 초기값
    industryName: string;
  } | null; // 회사 정보 수정 시 재심사(가입심사중) 전환 — update-company.action 참고
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
          industryId: true,
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
          industryId: user.company.industryId,
          industryName: user.company.industry.name,
        }
      : null,
  };
}

// 업종 선택지(회사 정보 수정 폼) — (auth)/company의 industries 쿼리와 동일 형태지만
// 레이어 규칙상 feature 간 import 가 금지라 소비 feature 로컬에 둔다.
export type IndustryOptionView = { id: string; name: string };

export async function getIndustryOptionsQuery(): Promise<IndustryOptionView[]> {
  return prisma.industry.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
}
