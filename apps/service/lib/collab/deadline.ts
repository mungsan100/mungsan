// 신청 마감일 판정 — 마감일은 "그날 하루 종일 신청 가능"으로 해석해, 마감일의
// 다음 날 0시부터 마감으로 본다. 서버 액션·쿼리·카드 UI가 공용으로 쓴다(순수 함수).
export function isDeadlinePassed(deadline: Date | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  const endOfDeadline = new Date(deadline);
  endOfDeadline.setHours(23, 59, 59, 999);
  return endOfDeadline < now;
}

// 마감까지 남은 일수(마감일 당일 = 0). 마감일 없거나 지났으면 null.
export function daysUntilDeadline(deadline: Date | null, now: Date = new Date()): number | null {
  if (!deadline || isDeadlinePassed(deadline, now)) return null;
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}
