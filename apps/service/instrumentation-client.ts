import * as Sentry from '@sentry/nextjs';

// 브라우저 측 Sentry 초기화 — NEXT_PUBLIC_SENTRY_DSN 이 없으면 완전 무동작.
// (NEXT_PUBLIC_ 값은 빌드 시점에 인라인되므로 배포 env 에 넣고 재배포해야 반영된다.)
// eslint-disable-next-line no-restricted-syntax -- 초기화 경계 파일: env 원본 읽기 허용
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0, // 오류 감지·기록만
  });
}

// App Router 내비게이션 계측 훅(SDK 요구 export — 트레이싱 꺼져 있어도 무해).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
