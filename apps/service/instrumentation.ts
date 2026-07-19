import * as Sentry from '@sentry/nextjs';

// 서버 기동 시점 훅(Next instrumentation) — Sentry 서버 초기화(오류 감지·기록 전용).
// SENTRY_DSN 이 없으면 완전 무동작. withSentryConfig 빌드 래핑 없이 수동 init 경로만 쓴다 —
// 소스맵 업로드는 없지만 감지·기록 목적에는 충분하고, Turbopack 빌드와의 충돌 여지를 없앤다.
export function register(): void {
  // eslint-disable-next-line no-restricted-syntax -- 초기화 경계: env 원본 읽기 허용
  const env = process.env;
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
