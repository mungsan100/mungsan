import 'server-only';

import { TURNSTILE_SECRET_KEY } from '@/config/server';

// Cloudflare Turnstile 서버 검증(2026-07-20 봇 방지) — 클라 위젯 토큰을 siteverify 로 확인한다.
// 키 미설정(로컬 dev)이면 생략하고 경고만 남긴다(Resend 폴백 컨벤션). 네트워크 오류는 차단이
// 아니라 통과로 — Cloudflare 장애가 가입 전체를 막지 않게(위험보다 가용성 우선, 로그 남김).
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function verifyTurnstileToken(token: string | null): Promise<TurnstileResult> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY 미설정 — 봇 방지 검증 생략(로컬 dev 전용이어야 함)');
    return { ok: true };
  }
  if (!token) return { ok: false, reason: 'missing-input-response' };

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (data.success) return { ok: true };
    return { ok: false, reason: (data['error-codes'] ?? []).join(',') || 'verification-failed' };
  } catch (err) {
    console.error('[turnstile] siteverify 호출 실패 — 가용성 우선으로 통과 처리', err);
    return { ok: true };
  }
}
