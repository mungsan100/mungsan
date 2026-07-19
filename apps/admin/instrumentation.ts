import * as Sentry from '@sentry/nextjs';

// 서버 기동 시점 훅(Next instrumentation) — ① 배포 진단 로그 ② Sentry 서버 초기화.
//
// [env-check] 민감 변수(DATABASE_URL 등)는 "존재 여부만" 남긴다 — 값은 절대 출력하지 않는다.
// 빈 문자열("")도 미주입(__MISSING__)으로 취급한다. PORT·APP_ENV·NODE_ENV는 비밀값이
// 아니므로 실값을 남겨 플랫폼의 포트 주입 여부까지 진단한다.
//
// [Sentry] SENTRY_DSN 이 없으면 완전 무동작(감지·기록 전용, 자동 수정 없음).
// withSentryConfig 빌드 래핑 없이 수동 init 경로만 쓴다 — 소스맵 업로드는 없지만
// 오류 감지·기록 목적에는 충분하고, Turbopack 빌드와의 충돌 여지를 없앤다.
export function register(): void {
  // eslint-disable-next-line no-restricted-syntax -- 진단·초기화 경계: env 원본 읽기 허용
  const env = process.env;
  const secretKeys = ['DATABASE_URL', 'BLOB_READ_WRITE_TOKEN', 'BLOB_STORE_ID'];
  const publicKeys = ['PORT', 'APP_ENV', 'NODE_ENV'];
  const parts = [
    ...secretKeys.map((key) => `${key}=${env[key] ? 'set' : '__MISSING__'}`),
    ...publicKeys.map((key) => `${key}=${env[key] ?? '(unset)'}`),
  ];
  console.log(`[env-check] ${parts.join(' ')} SENTRY_DSN=${env.SENTRY_DSN ? 'set' : '(unset)'}`);

  if (env.NEXT_RUNTIME === 'nodejs' && env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      tracesSampleRate: 0, // 오류 감지·기록만 — 성능 트레이싱 끔(무료 쿼터 절약)
      environment: env.APP_ENV ?? env.NODE_ENV ?? 'development',
    });
  }
}

// 서버 렌더·라우트 오류를 Sentry 로 전달(미초기화 시 no-op).
export const onRequestError = Sentry.captureRequestError;
