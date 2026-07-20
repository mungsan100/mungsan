import 'server-only';

import { DB } from '@mungsan/db';

import { AI_API_KEY, AI_BASE_URL, AI_MODEL } from '@/config/server';

// 라운지 글 자동 카테고리 분류(2026-07-20, 5-3) — 제목+내용을 AI가 11종 중 하나로 분류한다.
// 애매하거나 AI 미설정·실패·타임아웃이면 ETC 폴백(작성 흐름은 절대 막지 않는다).
// admin 지원사업 태깅과 동일 게이트웨이(빌링AI, claude-haiku-4-5) 재사용.
const TIMEOUT_MS = 3000;

// 카테고리 → 분류 힌트(프롬프트용). enum 순서와 무관하게 여기서 어휘를 제어한다.
const CATEGORY_HINTS: Record<DB.LoungeCategory, string> = {
  COLLABORATION: '협업 제안·파트너십·공동 사업 모색',
  BUSINESS_CONCERN: '사업 방향·성장·피벗 등 일반 경영 고민',
  INVESTMENT_FUNDING: '투자 유치·자금 조달·IR·밸류에이션',
  DEVELOPMENT_TECH: '개발·기술 스택·인프라·제품 구현',
  MARKETING_SALES: '마케팅·영업·브랜딩·고객 확보',
  GOVERNMENT_SUPPORT: '정부지원사업·정책자금·R&D 과제',
  HIRING_HR: '채용·인사·평가·보상·인력 운영',
  ORG_CULTURE: '조직문화·팀빌딩·리더십·소통',
  OUTSOURCING: '외주·아웃소싱·용역·프리랜서 활용',
  BURNOUT_MENTAL: '번아웃·멘탈 관리·대표의 심리·스트레스',
  ETC: '위 어디에도 명확히 속하지 않음',
};

const VALID = new Set(Object.keys(CATEGORY_HINTS));

// 분류 실행. 항상 유효한 LoungeCategory 를 반환(실패 시 ETC).
export async function classifyLoungeCategory(
  title: string,
  content: string,
): Promise<DB.LoungeCategory> {
  if (!AI_BASE_URL || !AI_MODEL || !AI_API_KEY) return 'ETC';

  const prompt = [
    '다음 커뮤니티 글을 카테고리 하나로 분류하라. 대상 독자는 스타트업 대표·임원이다.',
    '아래 카테고리 코드 중 정확히 하나만 골라 JSON 으로만 답하라: {"category":"<코드>"}',
    ...(Object.entries(CATEGORY_HINTS) as [DB.LoungeCategory, string][]).map(
      ([code, hint]) => `- ${code}: ${hint}`,
    ),
    '명확히 해당하는 게 없으면 ETC 로 답하라. 억지로 맞추지 마라.',
    '',
    `제목: ${title}`,
    `내용: ${content.slice(0, 1500)}`,
  ].join('\n');

  try {
    const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 30,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return 'ETC';
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? '';
    const parsed = text.match(/\{[\s\S]*\}/)?.[0];
    const category = parsed ? String(JSON.parse(parsed).category ?? '').trim() : '';
    return VALID.has(category) ? (category as DB.LoungeCategory) : 'ETC';
  } catch {
    // 타임아웃·네트워크·파싱 실패 전부 폴백 — 작성 흐름을 막지 않는다.
    return 'ETC';
  }
}
