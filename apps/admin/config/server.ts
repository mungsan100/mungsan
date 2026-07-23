import 'server-only';

// 서버 전용 환경변수의 검증된 단일 소스 — process.env 직접 접근은 이 경계 파일에서만 허용된다.

// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ── AI 게이트웨이 (OpenAI 호환 chat/completions) ─────────────────────────────
// 셋 중 하나라도 없으면 "AI 비활성 모드" — 에러가 아니라 정상 동작 경로다(요약 없이 원문 노출).
// 제공사 교체(빌링AI 만료 등)는 이 env 값 변경만으로 끝난다(코드 무수정).
// 수집 스크립트(scripts/sync-support-programs.mjs)는 Next 밖에서 돌므로 process.env를
// 직접 읽지만, 반드시 이 파일과 같은 의미(없으면 비활성)를 따른다.

// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const AI_BASE_URL = process.env.AI_BASE_URL ?? null;
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const AI_API_KEY = process.env.AI_API_KEY ?? null;
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const AI_MODEL = process.env.AI_MODEL ?? null;
