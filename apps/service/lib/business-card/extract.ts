import 'server-only';

import { AI_API_KEY, AI_BASE_URL, AI_MODEL } from '@/config/server';

// 명함 이미지 → 5필드 추출(2026-07-21) — 게이트웨이(빌링AI, OpenAI 호환, claude-haiku-4-5)의
// 비전 입력을 쓴다. 라이브 검증에서 image_url 포맷 5/5 추출 확인. AI 미설정·실패·타임아웃이면
// 전부 빈 값으로 반환한다(사용자가 직접 입력해 저장할 수 있게 — 흐름을 막지 않는다).
const TIMEOUT_MS = 20000; // 비전은 텍스트보다 느려 여유를 둔다

export type ExtractedCard = {
  name: string;
  company: string;
  jobTitle: string;
  phone: string;
  email: string;
};

const EMPTY: ExtractedCard = { name: '', company: '', jobTitle: '', phone: '', email: '' };

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// imageDataUrl: "data:image/jpeg;base64,...." (클라에서 압축한 값). 게이트웨이에 그대로 넘긴다.
export async function extractBusinessCard(imageDataUrl: string): Promise<ExtractedCard> {
  if (!AI_BASE_URL || !AI_MODEL || !AI_API_KEY) return EMPTY;
  if (!/^data:image\/\w+;base64,/.test(imageDataUrl)) return EMPTY;

  const instruction =
    '이 이미지는 명함이다. 이름·회사·직책·연락처·이메일을 읽어 JSON 으로만 답하라(설명·코드펜스 금지). ' +
    '형식: {"name":"","company":"","jobTitle":"","phone":"","email":""} — 못 읽은 항목은 빈 문자열. ' +
    '연락처는 휴대폰/대표번호 중 대표 1개만.';

  try {
    const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 400,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: instruction },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return EMPTY;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? '';
    const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) return EMPTY;
    const p = JSON.parse(jsonText) as Record<string, unknown>;
    return {
      name: str(p.name),
      company: str(p.company),
      jobTitle: str(p.jobTitle),
      phone: str(p.phone),
      email: str(p.email),
    };
  } catch {
    // 타임아웃·네트워크·파싱 실패 — 빈 값 폴백(사용자 수동 입력 가능).
    return EMPTY;
  }
}
