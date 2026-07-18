// 배포 플랫폼 헬스체크 전용 — 인증 없이 항상 200을 반환한다(liveness).
// proxy.ts 의 matcher('/'·'/approvals/:path*') 밖이라 세션 검사를 타지 않는다 — matcher 를
// 넓힐 일이 생겨도 이 경로는 반드시 제외할 것. DB 등 의존성 검사는 일부러 하지 않는다
// (의존성 장애가 컨테이너 재시작 루프로 번지는 것을 막기 위한 liveness/readiness 분리).
export function GET(): Response {
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}
