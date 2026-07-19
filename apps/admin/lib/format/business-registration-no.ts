// 사업자등록번호 표시 유틸 — service의 lib/format/business-registration-no와 동일 규칙.
// 저장값(숫자만/하이픈 혼재)과 무관하게 000-00-00000 로 통일 표시, 10자리가 아니면 원본 유지.
export function formatBrnDisplay(stored: string): string {
  const digits = stored.replace(/\D/g, '');
  if (digits.length !== 10) return stored;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
