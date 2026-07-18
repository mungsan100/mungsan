// 앱 전역 타임존 단일 진실원 — 시각은 UTC 저장, 표시할 때만 KST.
// service 는 date-fns-tz 기반 formatKst 를 쓰지만, admin 은 표시 패턴이 하나뿐이라
// 의존성 없이 Intl 로 처리한다.
const KST_DATE_TIME = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatKstDateTime(date: Date): string {
  return KST_DATE_TIME.format(date);
}
