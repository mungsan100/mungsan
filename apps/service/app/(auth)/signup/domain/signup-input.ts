import 'server-only';

import { type Result, err, ok } from 'neverthrow';
import type { DB } from '@mungsan/db';

// 회원가입 입력값 — 생성 시점의 불변식을 캡슐화한다(CollaborationPost.create와 동일 패턴).
type SignupInputErr =
  | { code: 'NAME_REQUIRED'; message: string }
  | { code: 'PHONE_REQUIRED'; message: string }
  | { code: 'EMAIL_INVALID'; message: string }
  | { code: 'PASSWORD_TOO_SHORT'; message: string }
  | { code: 'JOB_TITLE_REQUIRED'; message: string }
  | { code: 'CONSENT_REQUIRED'; message: string };

export type CreateSignupInput = {
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SignupInput {
  public readonly name: string;
  public readonly phone: string;
  public readonly email: string;
  public readonly password: string;
  public readonly executiveRole: DB.ExecutiveRole;
  public readonly jobTitle: string | null;
  public readonly agreedMarketing: boolean;

  private constructor(
    name: string,
    phone: string,
    email: string,
    password: string,
    executiveRole: DB.ExecutiveRole,
    jobTitle: string | null,
    agreedMarketing: boolean,
  ) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.password = password;
    this.executiveRole = executiveRole;
    this.jobTitle = jobTitle;
    this.agreedMarketing = agreedMarketing;
  }

  public static create(input: CreateSignupInput): Result<SignupInput, SignupInputErr> {
    const name = input.name.trim();
    const phone = input.phone.trim();
    const email = input.email.trim().toLowerCase();

    if (!name) return err({ code: 'NAME_REQUIRED', message: '이름을 입력해 주세요.' });
    if (!phone) return err({ code: 'PHONE_REQUIRED', message: '연락처를 입력해 주세요.' });
    if (!EMAIL_RE.test(email)) return err({ code: 'EMAIL_INVALID', message: '올바른 이메일 형식이 아닙니다.' });
    if (input.password.length < 8)
      return err({ code: 'PASSWORD_TOO_SHORT', message: '비밀번호는 8자 이상이어야 합니다.' });

    const jobTitle = input.jobTitle?.trim() || null;
    if (input.executiveRole === 'OTHER' && !jobTitle)
      return err({ code: 'JOB_TITLE_REQUIRED', message: '직책을 입력해 주세요.' });

    if (!input.agreedTerms || !input.agreedPrivacy)
      return err({ code: 'CONSENT_REQUIRED', message: '필수 약관에 동의해 주세요.' });

    return ok(
      new SignupInput(
        name,
        phone,
        email,
        input.password,
        input.executiveRole,
        input.executiveRole === 'OTHER' ? jobTitle : null,
        input.agreedMarketing,
      ),
    );
  }
}
