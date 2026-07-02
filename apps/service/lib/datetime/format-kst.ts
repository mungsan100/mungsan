import { formatInTimeZone } from 'date-fns-tz';

// 앱 전역 타임존 단일 진실원 — 시각은 UTC 저장, 표시할 때만 KST. 패턴은 호출부가 고른다.
export function formatKst(date: Date, pattern: string): string {
  return formatInTimeZone(date, 'Asia/Seoul', pattern);
}
