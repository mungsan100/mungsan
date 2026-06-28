import { createHmac } from 'node:crypto';

// NCP SENS(문자 발송 API) 호출에 필요한 주입 config. 패키지는 process.env를 직접 읽지 않고
// 각 앱이 검증된 config(config/server.ts)에서 값을 주입한다 — @mungsan/email createMailer 동형.
export type SmsConfig = {
  serviceId: string; // SENS 프로젝트 서비스 ID
  accessKey: string; // NCP IAM access key
  secretKey: string; // NCP IAM secret key (서명용)
  sender: string; // 사전 등록된 발신번호
};

// 발송 결과. 예측 가능한 실패(SENS 거절 = 비 2xx)는 throw하지 않고 result 객체로 반환한다.
// fetch 자체가 reject되는 네트워크/인프라 치명상만 throw로 전파한다.
export type SmsResult = { ok: true } | { ok: false; reason: 'SEND_FAILED' };

const SENS_HOST = 'https://sens.apigw.ntruss.com';

// 주입된 키/발신번호로 SENS 클라이언트를 1회 구성한다. sendSms만 외부에 노출.
export function createSmsSender(config: SmsConfig) {
  const urlPath = `/sms/v2/services/${config.serviceId}/messages`;

  // NCP API Gateway v2 서명: base64(HMAC-SHA256(secretKey, "{method} {urlPath}\n{timestamp}\n{accessKey}")).
  function sign(timestamp: string): string {
    const message = `POST ${urlPath}\n${timestamp}\n${config.accessKey}`;
    return createHmac('sha256', config.secretKey).update(message).digest('base64');
  }

  return {
    async sendSms(input: { to: string; content: string }): Promise<SmsResult> {
      const timestamp = String(Date.now());
      const body = JSON.stringify({
        type: 'SMS',
        from: config.sender,
        content: input.content,
        messages: [{ to: input.to, content: input.content }],
      });
      // fetch reject(네트워크 단절 등)는 잡지 않고 그대로 던진다 — 인프라 치명상.
      const res = await fetch(`${SENS_HOST}${urlPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': config.accessKey,
          'x-ncp-apigw-signature-v2': sign(timestamp),
        },
        body,
      });
      // SENS는 접수 성공 시 202를 준다. 비 2xx = 예측 가능한 발송 실패.
      if (!res.ok) return { ok: false, reason: 'SEND_FAILED' };
      return { ok: true };
    },
  };
}
