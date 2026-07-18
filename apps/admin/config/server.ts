import 'server-only';

// 서버 전용 환경변수의 검증된 단일 소스 — process.env 직접 접근은 이 경계 파일에서만 허용된다.

// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
