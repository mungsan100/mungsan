'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { SignupInput } from '@/app/(auth)/signup/domain/signup-input';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type SignupCommand = {
  name: string;
  phone: string;
  email: string;
  password: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  agreedMarketing: boolean;
};

const TERMS_VERSION = '2026-07-15';

export async function signupAction(cmd: SignupCommand): Promise<ActionResult> {
  const result = SignupInput.create(cmd);
  if (result.isErr())
    return {
      ok: false,
      code: result.error.code,
      field: fieldOf(result.error.code),
      message: result.error.message,
    };
  const input = result.value;

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, withdrawnAt: true, deletedAt: true, company: { select: { id: true } } },
  });
  if (existing) {
    // 가입 신청은 "기업정보 등록까지" 완료해야 성립한다. 기업정보 전에 이탈한 미완성 계정은
    // middleware 게이트상 콘텐츠를 만들 수 없어(세션·약관동의·인증토큰만 존재) 정리해도 무해하다 —
    // 같은 이메일로 재가입 시 막지 않고 이전 흔적을 지운 뒤 처음부터 다시 진행시킨다.
    // 탈퇴(withdrawnAt)·비활성(deletedAt) 계정은 기존 정책(재가입 불가) 유지.
    const incomplete = !existing.company && !existing.withdrawnAt && !existing.deletedAt;
    if (!incomplete)
      return { ok: false, code: 'EMAIL_TAKEN', field: 'email', message: '이미 가입된 이메일입니다.' };

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: existing.id } }),
      prisma.verificationToken.deleteMany({ where: { userId: existing.id } }),
      prisma.userConsent.deleteMany({ where: { userId: existing.id } }),
      prisma.loungeProfile.deleteMany({ where: { userId: existing.id } }), // 게이트상 생성 불가지만 방어
      prisma.user.delete({ where: { id: existing.id } }),
    ]);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        passwordHash,
        executiveRole: input.executiveRole,
        jobTitle: input.jobTitle,
      },
      select: { id: true },
    });

    const consents: { type: DB.ConsentType; version: string }[] = [
      { type: 'TERMS', version: TERMS_VERSION },
      { type: 'PRIVACY', version: TERMS_VERSION },
    ];
    if (input.agreedMarketing) consents.push({ type: 'MARKETING', version: TERMS_VERSION });

    await tx.userConsent.createMany({ data: consents.map((c) => ({ ...c, userId: created.id })) });

    return created;
  });

  await createSession(user.id);
  redirect('/company');
}

function fieldOf(code: string): string | undefined {
  switch (code) {
    case 'NAME_REQUIRED':
      return 'name';
    case 'PHONE_REQUIRED':
      return 'phone';
    case 'EMAIL_INVALID':
      return 'email';
    case 'PASSWORD_TOO_SHORT':
      return 'password';
    case 'JOB_TITLE_REQUIRED':
      return 'jobTitle';
    default:
      return undefined;
  }
}
