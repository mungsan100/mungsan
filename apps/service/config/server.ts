import 'server-only';

// 서버 전용 환경변수의 검증된 단일 소스 — process.env 직접 접근은 이 경계 파일에서만 허용된다.

// 데모 현재-유저 리졸버가 쓰는 이메일(선택). 없으면 첫 승인 유저로 폴백한다.
// eslint-disable-next-line no-restricted-syntax -- config 경계 파일: env 원본 읽기 허용
export const DEMO_USER_EMAIL: string | undefined = process.env.DEMO_USER_EMAIL;
