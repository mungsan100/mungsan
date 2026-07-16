import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// UTC Date → "약 2시간 전" 상대 표기(한국어). 표시 전용 — 시각 자체는 UTC canonical 유지.
export function formatRelativeKorean(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
}
