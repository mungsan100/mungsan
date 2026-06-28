import { Resend } from 'resend';

// 메일 소유를 인증한 수신자임을 타입으로 증명하는 브랜드 타입. unique symbol 브랜드라
// 외부에서 string을 as 캐스팅으로 위조할 수 없고, 오직 아래 verifiedEmail()로만 만든다.
declare const verifiedBrand: unique symbol;
export type VerifiedEmail = string & { readonly [verifiedBrand]: true };

// VerifiedEmail을 만드는 유일한 통로(parse, don't validate). emailVerifiedAt(DB 인증 시각)이
// 있어야만 발급하고, 미인증이면 null을 돌려 호출부가 "보낼 수 없음"을 타입으로 처리하게 한다.
export function verifiedEmail(email: string, emailVerifiedAt: Date | null): VerifiedEmail | null {
  return emailVerifiedAt ? (email as VerifiedEmail) : null;
}

// 인증 수신자 전용. to가 VerifiedEmail이라 미인증 주소는 컴파일 단계에서 막힌다.
export type SendEmailInput = { to: VerifiedEmail; subject: string; html: string };
// 미인증/미상 주소로의 의도적 발송(인증 메일·비번 재설정·CS 답변)용 — to는 raw string.
export type SendUnverifiedEmailInput = { to: string; subject: string; html: string };
export type SendEmailResult = { ok: true } | { ok: false; error: string };

// Resend 클라이언트를 주입된 키/발신자로 1회 구성한다. 각 앱이 검증된 config에서 키를 주입한다
// (패키지는 process.env를 직접 읽지 않는다 — @mungsan/file 의 createUploadHandler 와 동형).
export function createMailer(config: { apiKey: string; from: string }) {
  const resend = new Resend(config.apiKey);
  // 전송 로직은 공통. 수신자 인증 여부는 아래 두 메서드의 to 타입(VerifiedEmail vs string)으로만 가른다.
  // 발송 실패를 throw하지 않고 결과 객체로 반환한다(예측 가능한 에러 = 결과 객체).
  async function send(to: string, subject: string, html: string): Promise<SendEmailResult> {
    const { error } = await resend.emails.send({ from: config.from, to, subject, html });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  return {
    // 인증된 수신자에게만 발송. 미인증 주소는 타입에서 막힌다.
    sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
      return send(input.to, input.subject, input.html);
    },
    // 미인증 주소로의 의도적 발송. 이름이 곧 우회 경고 — 인증 메일·비번 재설정·CS 답변처럼
    // 수신자가 아직 인증되지 않은(또는 비회원인) 시스템 메일만 이 통로를 쓴다.
    sendToUnverified(input: SendUnverifiedEmailInput): Promise<SendEmailResult> {
      return send(input.to, input.subject, input.html);
    },
  };
}

// 공통 브랜드 래퍼 + (선택) CTA 버튼. 개별 메일 본문(콘텐츠)은 각 앱이 소유하고 이 레이아웃에 끼운다.
export function emailLayout(input: {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}): string {
  const button = input.cta
    ? `<a href="${input.cta.href}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">${input.cta.label}</a>`
    : '';
  return `<!doctype html>
<html lang="ko"><body style="margin:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px">
        <tr><td style="font-size:20px;font-weight:700;color:#111827;padding-bottom:8px">뭉산</td></tr>
        <!-- TODO(mungsan): 이메일 브랜딩 확정 필요 -->
        <tr><td style="font-size:18px;font-weight:700;color:#111827;padding-bottom:12px">${input.heading}</td></tr>
        <tr><td style="font-size:14px;line-height:1.7;color:#4b5563;padding-bottom:24px">${input.body}</td></tr>
        <tr><td>${button}</td></tr>
        <tr><td style="font-size:12px;color:#9ca3af;padding-top:32px">본 메일은 발신 전용입니다.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
