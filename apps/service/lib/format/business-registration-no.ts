// 사업자등록번호 표기 유틸 — 입력은 000-00-00000 자동 포맷, 표시는 저장 형식과 무관하게 통일.
// 순수 함수(클라이언트 폼·서버 표시 공용). 저장은 기존대로 숫자 10자리(액션이 정규화) — DB 무변경.

// 입력 중 자동 포맷 — 숫자만 남기고(최대 10자리) 자릿수에 맞춰 하이픈을 붙인다.
export function formatBrnInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

// 저장값(숫자만/하이픈 혼재) → 표시 형식. 10자리가 아니면 원본 그대로(데이터 훼손 없음).
export function formatBrnDisplay(stored: string): string {
  const digits = stored.replace(/\D/g, '');
  if (digits.length !== 10) return stored;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

// 10자리 여부 — 폼 제출 가능 판정.
export function isValidBrn(value: string): boolean {
  return value.replace(/\D/g, '').length === 10;
}
