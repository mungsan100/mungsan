// 연락처 표기 유틸(2026-07-20, 4-2) — 입력은 000-0000-0000 자동 포맷, 저장은 숫자만(액션 정규화).
// 사업자등록번호 유틸(business-registration-no)과 같은 방식. 순수 함수 — 클라 폼·서버 표시 공용.

// 입력 중 자동 포맷 — 숫자만 남기고(최대 11자리) 자릿수에 맞춰 하이픈을 붙인다.
// 11자리(휴대폰) 3-4-4, 10자리 3-3-4. 그 미만은 진행 중 입력으로 보고 앞에서부터 끊는다.
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// 저장값(숫자만/하이픈 혼재) → 표시 형식. 10~11자리가 아니면 원본 그대로(데이터 훼손 없음).
export function formatPhoneDisplay(stored: string): string {
  const digits = stored.replace(/\D/g, '');
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return stored;
}
