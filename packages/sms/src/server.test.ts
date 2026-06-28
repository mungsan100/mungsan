import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'node:crypto';

import { createSmsSender } from './server';

const CONFIG = {
  serviceId: 'svc-1',
  accessKey: 'ACCESS_KEY',
  secretKey: 'SECRET_KEY',
  sender: '01000000000',
};
const FIXED_MS = 1_700_000_000_000;

// server.ts와 동일한 규칙으로 서명을 독립 재계산 → 결정론적 base64 HMAC임을 검증.
function expectedSignature(): string {
  const urlPath = `/sms/v2/services/${CONFIG.serviceId}/messages`;
  const message = `POST ${urlPath}\n${FIXED_MS}\n${CONFIG.accessKey}`;
  return createHmac('sha256', CONFIG.secretKey).update(message).digest('base64');
}

describe('createSmsSender', () => {
  beforeEach(() => {
    // 타임스탬프 고정 → 서명 결정론화.
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_MS);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('NCP SENS 엔드포인트로 서명·헤더·바디를 POST한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal('fetch', fetchMock);

    const sms = createSmsSender(CONFIG);
    await sms.sendSms({ to: '01012345678', content: '[Trefit] 인증번호 123456' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe('https://sens.apigw.ntruss.com/sms/v2/services/svc-1/messages');
    expect(init.method).toBe('POST');

    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json; charset=utf-8');
    expect(headers['x-ncp-apigw-timestamp']).toBe(String(FIXED_MS));
    expect(headers['x-ncp-iam-access-key']).toBe('ACCESS_KEY');
    expect(headers['x-ncp-apigw-signature-v2']).toBe(expectedSignature());

    expect(JSON.parse(init.body as string)).toEqual({
      type: 'SMS',
      from: '01000000000',
      content: '[Trefit] 인증번호 123456',
      messages: [{ to: '01012345678', content: '[Trefit] 인증번호 123456' }],
    });
  });

  it('2xx 응답이면 { ok: true }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 202 }));
    const sms = createSmsSender(CONFIG);
    await expect(sms.sendSms({ to: '01012345678', content: 'hi' })).resolves.toEqual({
      ok: true,
    });
  });

  it('비 2xx 응답이면 { ok: false, reason: SEND_FAILED }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    const sms = createSmsSender(CONFIG);
    await expect(sms.sendSms({ to: '01012345678', content: 'hi' })).resolves.toEqual({
      ok: false,
      reason: 'SEND_FAILED',
    });
  });
});
