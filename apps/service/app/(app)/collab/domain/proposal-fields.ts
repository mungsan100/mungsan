// 제안 구조화 필드(PRD FR-CLBMK-3) — 제출·임시저장 액션이 공용으로 쓰는 검증/합성.
// 'use server' 파일은 async export 만 허용되므로 동기 헬퍼는 여기(domain)에 둔다.

export type ProposalFields = {
  introduction: string | null; // 자기소개
  interestReason: string | null; // 관심 이유
  contributionCapability: string | null; // 기여 가능 역량
  collaborationMethod: string | null; // 협업 가능 방식
  meetingAvailability: string | null; // 미팅 가능 일정
  contributionRole: string | null; // 기여 역할(협업 가능 영역)
};

const FIELD_MAX = 500;

const FIELD_LABELS: Record<keyof ProposalFields, string> = {
  introduction: '자기소개',
  interestReason: '관심 이유',
  contributionCapability: '기여 가능 역량',
  collaborationMethod: '협업 가능 방식',
  meetingAvailability: '미팅 가능 일정',
  contributionRole: '기여 역할',
};

type ValidateResult =
  | { ok: true; fields: ProposalFields }
  | { ok: false; field: string; message: string };

// requireCore: 제출 시 자기소개·관심 이유는 필수(각 10자 이상). 임시저장은 전부 선택
// (단 전부 비어 있으면 저장할 내용이 없으므로 거부).
export function validateProposalFields(
  input: Partial<ProposalFields>,
  { requireCore }: { requireCore: boolean },
): ValidateResult {
  const fields: ProposalFields = {
    introduction: input.introduction?.trim() || null,
    interestReason: input.interestReason?.trim() || null,
    contributionCapability: input.contributionCapability?.trim() || null,
    collaborationMethod: input.collaborationMethod?.trim() || null,
    meetingAvailability: input.meetingAvailability?.trim() || null,
    contributionRole: input.contributionRole?.trim() || null,
  };

  for (const key of Object.keys(fields) as (keyof ProposalFields)[]) {
    const value = fields[key];
    if (value && value.length > FIELD_MAX)
      return { ok: false, field: key, message: `${FIELD_LABELS[key]}은(는) ${FIELD_MAX}자 이내로 입력해 주세요.` };
  }

  if (requireCore) {
    if (!fields.introduction || fields.introduction.length < 10)
      return { ok: false, field: 'introduction', message: '자기소개를 10자 이상 입력해 주세요.' };
    if (!fields.interestReason || fields.interestReason.length < 10)
      return { ok: false, field: 'interestReason', message: '관심 이유를 10자 이상 입력해 주세요.' };
  } else if (Object.values(fields).every((v) => v == null)) {
    return { ok: false, field: 'introduction', message: '저장할 내용을 한 가지 이상 입력해 주세요.' };
  }

  return { ok: true, fields };
}

// message 전문 합성 — 입력된 항목만 [라벨] 블록으로 잇는다(기존 화면·신고 스냅샷과 호환).
export function composeProposalMessage(fields: ProposalFields): string {
  const blocks = (Object.keys(FIELD_LABELS) as (keyof ProposalFields)[])
    .filter((key) => fields[key])
    .map((key) => `[${FIELD_LABELS[key]}]\n${fields[key]}`);
  return blocks.length > 0 ? blocks.join('\n\n') : '(임시저장)';
}
