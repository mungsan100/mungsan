// ⚠ 임시 배포 진단용 — admin 배포 SIGTERM 재시작 루프의 원인(환경변수 미주입/포트 불일치)
// 확인 후 제거할 것. 서버 기동 시점에 한 번 실행된다(Next instrumentation hook).
//
// 민감 변수(DATABASE_URL 등)는 "존재 여부만" 남긴다 — 값은 절대 출력하지 않는다.
// 빈 문자열("")도 미주입(__MISSING__)으로 취급한다. PORT·APP_ENV·NODE_ENV는 비밀값이
// 아니므로 실값을 남겨 플랫폼의 포트 주입 여부까지 진단한다.
export function register(): void {
  // eslint-disable-next-line no-restricted-syntax -- 임시 진단 경계: env 존재 여부만 확인
  const env = process.env;
  const secretKeys = ['DATABASE_URL', 'BLOB_READ_WRITE_TOKEN', 'BLOB_STORE_ID'];
  const publicKeys = ['PORT', 'APP_ENV', 'NODE_ENV'];
  const parts = [
    ...secretKeys.map((key) => `${key}=${env[key] ? 'set' : '__MISSING__'}`),
    ...publicKeys.map((key) => `${key}=${env[key] ?? '(unset)'}`),
  ];
  console.log(`[env-check] ${parts.join(' ')}`);
}
