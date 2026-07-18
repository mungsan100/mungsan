'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type UpdateCompanyCommand = {
  name: string;
  businessRegistrationNo: string;
  industryId: string;
};

// 회사 정보 수정(회사명/사업자등록번호/업종) → 즉시 재심사 전환(#결정).
// 심사 대상 정보가 바뀌므로 저장과 같은 트랜잭션에서 User.approvedAt 을 null 로 되돌려
// 가입심사중 게이트(middleware)가 서비스 이용을 차단하게 한다. 반려 기록도 함께 지워
// "재심사 대기" 상태로 정규화한다. 변경 전→후 값은 CompanyRevision 으로 보존해
// admin 심사 화면의 근거 자료가 된다. 검증 규칙은 등록(company-registration-input)과 동일.
export async function updateCompanyAction(cmd: UpdateCompanyCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  const name = cmd.name.trim();
  if (!name) return { ok: false, field: 'name', message: '회사명을 입력해 주세요.' };
  if (name.length > 100)
    return { ok: false, field: 'name', message: '회사명은 100자 이내로 입력해 주세요.' };

  const digits = cmd.businessRegistrationNo.replace(/\D/g, '');
  if (digits.length !== 10)
    return {
      ok: false,
      field: 'businessRegistrationNo',
      message: '사업자등록번호 10자리를 정확히 입력해 주세요.',
    };

  const industry = await prisma.industry.findUnique({
    where: { id: cmd.industryId.trim() },
    select: { id: true, name: true },
  });
  if (!industry)
    return { ok: false, field: 'industryId', message: '존재하지 않는 업종입니다.' };

  const company = await prisma.company.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      businessRegistrationNo: true,
      industryId: true,
      industry: { select: { name: true } },
    },
  });
  if (!company)
    return { ok: false, code: 'NO_COMPANY', message: '등록된 회사 정보가 없습니다.' };

  const unchanged =
    company.name === name &&
    company.businessRegistrationNo === digits &&
    company.industryId === industry.id;
  if (unchanged) return { ok: false, code: 'NO_CHANGE', message: '변경된 내용이 없습니다.' };

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: company.id },
      data: { name, businessRegistrationNo: digits, industryId: industry.id },
    });
    await tx.companyRevision.create({
      data: {
        companyId: company.id,
        nameBefore: company.name,
        nameAfter: name,
        businessRegistrationNoBefore: company.businessRegistrationNo,
        businessRegistrationNoAfter: digits,
        industryNameBefore: company.industry.name,
        industryNameAfter: industry.name,
      },
    });
    // 재심사 전환 — 승인 기록을 되돌리고 이전 반려 기록도 지운다(재심사 대기 상태로 정규화).
    await tx.user.update({
      where: { id: user.id },
      data: { approvedAt: null, rejectedAt: null, rejectedReason: null },
    });
  });

  revalidatePath('/manage');
  revalidatePath('/');
  return {
    ok: true,
    data: undefined,
    message: '회사 정보를 수정했습니다. 재심사가 시작되어 승인 완료까지 서비스 이용이 제한됩니다.',
  };
}
