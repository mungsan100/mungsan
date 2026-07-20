import 'server-only';

// 서버 전용 환경변수의 검증된 단일 소스 — process.env 직접 접근은 이 경계 파일에서만 허용된다.

// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// 메일 발송(Resend). 키가 없으면(로컬 dev) 발송을 생략하고 서버 콘솔에 링크를 남긴다 —
// 배포 환경에는 RESEND_API_KEY·EMAIL_FROM(인증된 발신 도메인)을 반드시 설정할 것.
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? null;
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const EMAIL_FROM = process.env.EMAIL_FROM ?? '뭉산 <noreply@mungsan.example>';

// Cloudflare Turnstile(가입 봇 방지). 키가 없으면(로컬 dev) 검증을 생략하고 콘솔에 경고만 —
// 배포 환경에는 TURNSTILE_SECRET_KEY·NEXT_PUBLIC_TURNSTILE_SITE_KEY 를 반드시 설정할 것.
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? null;

// AI 게이트웨이(빌링AI OpenAI 호환) — 라운지 글 자동 카테고리 분류(2026-07-20, 5-3).
// admin 지원사업 태깅과 동일 게이트웨이. 셋 다 있어야 분류 동작, 없으면(로컬·미설정) 폴백(ETC).
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const AI_BASE_URL = process.env.AI_BASE_URL ?? null;
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const AI_MODEL = process.env.AI_MODEL ?? null;
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const AI_API_KEY = process.env.AI_API_KEY ?? null;
