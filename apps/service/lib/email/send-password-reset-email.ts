import 'server-only';

import { createMailer, emailLayout } from '@mungsan/email/server';

import { EMAIL_FROM, RESEND_API_KEY } from '@/config/server';

// 비밀번호 재설정 메일. 수신자는 아직 이메일 인증 전일 수 있어 sendToUnverified 통로를 쓴다
// (@mungsan/email 의 의도된 우회 경로 — 비번 재설정·인증 메일 전용).
// RESEND_API_KEY 미설정(로컬 dev) 시 실발송 대신 서버 콘솔에 링크를 남긴다 —
// 배포 env 체크리스트에 RESEND_API_KEY·EMAIL_FROM 추가 필요.
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[password-reset] RESEND_API_KEY 미설정 — 발송 생략. 재설정 링크: ${resetUrl}`);
    return;
  }

  const html = emailLayout({
    heading: '비밀번호 재설정',
    body: '아래 버튼을 눌러 새 비밀번호를 설정해 주세요. 링크는 30분 동안만 유효합니다.<br/>본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.',
    cta: { label: '비밀번호 재설정', href: resetUrl },
  });

  const mailer = createMailer({ apiKey: RESEND_API_KEY, from: EMAIL_FROM });
  const result = await mailer.sendToUnverified({
    to,
    subject: '[뭉산] 비밀번호 재설정 안내',
    html,
  });
  // 계정 존재 비노출 정책상 실패해도 사용자 응답은 동일 — 서버 로그로만 남긴다.
  if (!result.ok) console.error(`[password-reset] 발송 실패: ${result.error}`);
}
