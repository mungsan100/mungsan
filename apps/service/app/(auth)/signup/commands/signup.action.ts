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
    select: { id: true },
  });
  if (existing) return { ok: false, code: 'EMAIL_TAKEN', field: 'email', message: '이미 가입된 이메일입니다.' };

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
