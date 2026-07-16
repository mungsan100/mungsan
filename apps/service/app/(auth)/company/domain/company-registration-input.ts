import 'server-only';

import { type Result, err, ok } from 'neverthrow';

// 기업정보 등록 입력값 — 생성 시점의 불변식을 캡슐화한다(CollaborationPost.create와 동일 패턴).
// 참조 무결성(industryId가 실존하는지)은 command 레벨에서 검증한다(taxonomy 무FK 컨벤션과 동일).
type CompanyRegistrationErr =
  | { code: 'NAME_REQUIRED'; message: string }
  | { code: 'BUSINESS_NO_INVALID'; message: string }
  | { code: 'INDUSTRY_REQUIRED'; message: string };

export type CreateCompanyRegistrationInput = {
  name: string;
  businessRegistrationNo: string;
  industryId: string;
};

export class CompanyRegistrationInput {
  public readonly name: string;
  public readonly businessRegistrationNo: string;
  public readonly industryId: string;

  private constructor(name: string, businessRegistrationNo: string, industryId: string) {
    this.name = name;
    this.businessRegistrationNo = businessRegistrationNo;
    this.industryId = industryId;
  }

  public static create(
    input: CreateCompanyRegistrationInput,
  ): Result<CompanyRegistrationInput, CompanyRegistrationErr> {
    const name = input.name.trim();
    if (!name) return err({ code: 'NAME_REQUIRED', message: '회사명을 입력해 주세요.' });

    const digits = input.businessRegistrationNo.replace(/\D/g, '');
    if (digits.length !== 10)
      return err({ code: 'BUSINESS_NO_INVALID', message: '사업자등록번호 10자리를 정확히 입력해 주세요.' });

    const industryId = input.industryId.trim();
    if (!industryId) return err({ code: 'INDUSTRY_REQUIRED', message: '업종을 선택해 주세요.' });

    return ok(new CompanyRegistrationInput(name, digits, industryId));
  }
}
