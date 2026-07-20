'use server';

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { prisma } from '@mungsan/db';
import { putFile } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { CompanyRegistrationInput } from '@/app/(auth)/company/domain/company-registration-input';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type RegisterCompanyCommand = {
  name: string;
  businessRegistrationNo: string;
  industryId: string;
  businessCertFile: File;
  brochureFile?: File; // 회사 소개서는 선택 — 사업자등록증만 필수
};

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB — 사업자등록증·소개서 PDF 감안(이미지 5MB 기본값보다 넉넉히)

export async function registerCompanyAction(cmd: RegisterCompanyCommand): Promise<ActionResult> {
  const result = CompanyRegistrationInput.create(cmd);
  if (result.isErr())
    return {
      ok: false,
      code: result.error.code,
      field: fieldOf(result.error.code),
      message: result.error.message,
    };
  const input = result.value;

  const user = await getCurrentUser();

  const existingCompany = await prisma.company.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existingCompany) return { ok: false, code: 'ALREADY_REGISTERED', message: '이미 기업정보를 등록했습니다.' };

  const industry = await prisma.industry.findUnique({
    where: { id: input.industryId },
    select: { id: true },
  });
  if (!industry) return { ok: false, code: 'INDUSTRY_NOT_FOUND', field: 'industryId', message: '존재하지 않는 업종입니다.' };

  // 사업자등록번호 중복 차단(2026-07-20 보안 결정) — 이미 "승인된" 타 계정이 같은 번호를 쓰면
  // 등록 자체를 거부한다. 심사 대기끼리는 허용(선착순 승인, 최종 방어는 승인 액션) — 오타 재신청
  // 등 정상 흐름을 막지 않기 위함. 저장값은 digits 정규화라 그대로 비교한다.
  const approvedDuplicate = await prisma.company.findFirst({
    where: {
      businessRegistrationNo: input.businessRegistrationNo,
      user: { approvedAt: { not: null }, withdrawnAt: null, deletedAt: null },
    },
    select: { id: true },
  });
  if (approvedDuplicate)
    return {
      ok: false,
      code: 'DUPLICATE_BRN',
      field: 'businessRegistrationNo',
      message: '이미 가입된 사업자등록번호입니다. 본인 회사가 맞다면 운영팀에 문의해 주세요.',
    };

  const certCheck = validateFile(cmd.businessCertFile);
  if (!certCheck.ok) return { ok: false, field: 'businessCertFile', message: certCheck.message };
  const brochureFile = cmd.brochureFile; // 선택 — 있으면만 검증·업로드
  if (brochureFile) {
    const brochureCheck = validateFile(brochureFile);
    if (!brochureCheck.ok) return { ok: false, field: 'brochureFile', message: brochureCheck.message };
  }

  // 이 Blob 스토어는 private-only로 프로비저닝되어 access:'public' 업로드 자체가 거부된다.
  // MEMBER 등급(소개서)도 blob 레벨에선 private로 올리고, 열람 시 getSignedReadUrl로 연다
  // (attachment.prisma 주석의 "MEMBER=public+앱게이트" 가정과 다르지만, 결과적으로 더 안전하다).
  const [businessCert, brochure] = await Promise.all([
    putFile(uploadPathname(cmd.businessCertFile), cmd.businessCertFile, {
      access: 'private',
      contentType: cmd.businessCertFile.type,
    }),
    brochureFile
      ? putFile(uploadPathname(brochureFile), brochureFile, {
          access: 'private',
          contentType: brochureFile.type,
        })
      : null,
  ]);

  await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.name,
        businessRegistrationNo: input.businessRegistrationNo,
        industryId: input.industryId,
        userId: user.id,
      },
      select: { id: true },
    });

    await tx.attachment.createMany({
      data: [
        {
          ownerType: 'COMPANY' as const,
          ownerId: company.id,
          kind: 'BUSINESS_CERT' as const,
          access: 'PRIVATE' as const,
          pathname: businessCert.pathname,
          fileName: cmd.businessCertFile.name,
          mimeType: businessCert.contentType,
          size: cmd.businessCertFile.size,
        },
        ...(brochure && brochureFile
          ? [
              {
                ownerType: 'COMPANY' as const,
                ownerId: company.id,
                kind: 'BROCHURE' as const,
                access: 'MEMBER' as const,
                pathname: brochure.pathname,
                fileName: brochureFile.name,
                mimeType: brochure.contentType,
                size: brochureFile.size,
              },
            ]
          : []),
      ],
    });
  });

  redirect('/');
}

function validateFile(file: File): { ok: true } | { ok: false; message: string } {
  if (file.size === 0) return { ok: false, message: '파일을 첨부해 주세요.' };
  if (file.size > MAX_BYTES) return { ok: false, message: '파일 크기는 10MB 이하여야 합니다.' };
  if (!ALLOWED_TYPES.includes(file.type)) return { ok: false, message: 'PDF 또는 이미지 파일만 업로드할 수 있습니다.' };
  return { ok: true };
}

function uploadPathname(file: File): string {
  const dot = file.name.lastIndexOf('.');
  const ext = dot > 0 ? file.name.slice(dot).toLowerCase() : '';
  return `${randomUUID()}${ext}`;
}

function fieldOf(code: string): string | undefined {
  switch (code) {
    case 'NAME_REQUIRED':
      return 'name';
    case 'BUSINESS_NO_INVALID':
      return 'businessRegistrationNo';
    case 'INDUSTRY_REQUIRED':
      return 'industryId';
    default:
      return undefined;
  }
}
