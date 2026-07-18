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
