// 연락처 표시 유틸(2026-07-20, 4-3) — service lib/format/phone 과 동일 규칙의 미러.
// 저장값(숫자만/하이픈 혼재)과 무관하게 000-0000-0000 으로 통일 표시, 형식 밖이면 원본 유지.
export function formatPhoneDisplay(stored: string): string {
  const digits = stored.replace(/\D/g, '');
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return stored;
}
