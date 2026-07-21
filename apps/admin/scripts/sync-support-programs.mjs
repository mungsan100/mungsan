// 지원사업 공고 동기화 (수동 실행, 2026-07-19) — K-Startup 수집 → upsert → AI 요약·업종 태깅.
// 설계 전제: AI·수집 키가 없어도 "정상 동작"한다 —
//   KSTARTUP_API_KEY 없음 → 수집 생략(기존 데이터 유지), AI env 미비 → AI 생략(원문 노출).
// 멱등: (source, sourceId) upsert. 삭제 없음 — 마감 지난 수집 건은 isActive=false 로만 내린다.
// 시드/수동 등록 행(source null)은 일절 건드리지 않는다.
// ⚠ 키 값은 어떤 로그에도 출력하지 않는다(카운트·상태만 출력).
//
// 사용: node --env-file=.env scripts/sync-support-programs.mjs
import { PrismaClient } from '../../../packages/db/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const dbUrl = new URL(process.env.DATABASE_URL);
const schema = dbUrl.searchParams.get('schema') ?? 'public';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema }),
});

// config/server.ts 와 동일한 의미(없으면 비활성) — 스크립트는 Next 밖이라 process.env 직접 읽기.
const KSTARTUP_API_KEY = process.env.KSTARTUP_API_KEY || null;
const AI_BASE_URL = process.env.AI_BASE_URL || null;
const AI_API_KEY = process.env.AI_API_KEY || null;
const AI_MODEL = process.env.AI_MODEL || null;
// --no-ai: 수집·갱신만 하고 AI 호출(크레딧 소모)은 건너뛴다 — 데이터 교정 재실행용.
const aiEnabled = Boolean(AI_BASE_URL && AI_API_KEY && AI_MODEL) && !process.argv.includes('--no-ai');

const KSTARTUP_ENDPOINT =
  'https://apis.data.go.kr/B552735/kisedKstartupService01/getAnnouncementInformation01';
const PER_PAGE = 100;
const MAX_PAGES = 10; // 안전 상한(모집중 공고 1,000건이면 충분)
const SUMMARY_MAX = 100; // 원문 폴백 요약 절단 길이
const AI_BATCH_MAX = 60; // 1회 실행당 AI 처리 상한(비용 가드)

// ── 1. 수집 ───────────────────────────────────────────────────────────────
// 응답 필드는 공식 가이드 기준 + 방어적 후보 매핑(운영 중 필드명 변형 대비).
// 원문에 섞여 오는 HTML 엔티티(&apos; 등)를 표시용 문자로 되돌린다.
const decodeEntities = (text) =>
  text
    .replaceAll('&amp;', '&')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ');

const pick = (item, keys) => {
  for (const key of keys) {
    const value = item?.[key];
    if (value != null && String(value).trim() !== '') return decodeEntities(String(value).trim());
  }
  return null;
};

// YYYYMMDD | YYYY-MM-DD → UTC 자정 Date (협업 마감일 저장 방식과 동일 계열).
function parseDate(raw) {
  if (!raw) return null;
  const digits = raw.replaceAll('-', '').slice(0, 8);
  if (!/^\d{8}$/.test(digits)) return null;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function mapItem(item) {
  const title = pick(item, ['biz_pbanc_nm', 'intg_pbanc_biz_nm', 'supt_biz_titl_nm', 'titl_nm']);
  const detailUrl = pick(item, ['detl_pg_url']);
  // 안정적 원본 id — 일련번호가 없으면 상세 URL 의 pbancSn 파라미터, 그것도 없으면 제목+시작일.
  let sourceId = pick(item, ['pbanc_sn', 'pbanc_no', 'id']);
  if (!sourceId && detailUrl) {
    const match = detailUrl.match(/pbancSn=(\d+)/i);
    if (match) sourceId = match[1];
  }
  if (!sourceId && title) sourceId = `${title}|${pick(item, ['pbanc_rcpt_bgng_dt']) ?? ''}`;
  if (!title || !sourceId) return null; // 식별 불가 항목은 건너뜀

  return {
    sourceId,
    title,
    organization:
      pick(item, ['pbanc_ntrp_nm', 'sprv_inst_nm', 'excutr_inst_nm', 'sprv_inst']) ?? '창업진흥원',
    applicationStartDate: parseDate(pick(item, ['pbanc_rcpt_bgng_dt'])),
    applicationEndDate: parseDate(pick(item, ['pbanc_rcpt_end_dt'])),
    region: pick(item, ['supt_regin']),
    targetAudience: pick(item, ['aply_trgt_ctnt', 'aply_trgt']),
    rawSummary: pick(item, ['pbanc_ctnt', 'supt_biz_intrd_info', 'bsns_sumry']) ?? title,
    detailUrl,
  };
}

async function fetchAllAnnouncements() {
  const collected = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(KSTARTUP_ENDPOINT);
    url.searchParams.set('ServiceKey', KSTARTUP_API_KEY);
    url.searchParams.set('page', String(page));
    url.searchParams.set('perPage', String(PER_PAGE));
    url.searchParams.set('returnType', 'json');
    url.searchParams.set('rcrt_prgs_yn', 'Y'); // 모집 중 공고만

    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`K-Startup API HTTP ${res.status}`);
    const payload = await res.json();
    const items = payload?.data ?? payload?.items ?? payload?.response?.body?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) break;
    collected.push(...items);
    const total = Number(payload?.totalCount ?? payload?.matchCount ?? NaN);
    if (Number.isFinite(total) && collected.length >= total) break;
    if (items.length < PER_PAGE) break;
  }
  return collected;
}

// 이번 실행 시작 시각 — 맞춤 알림(3단계)이 "이번 실행에서 새로 등록된 공고"를 식별하는 기준.
const runStartedAt = new Date();

const stats = {
  fetched: 0,
  created: 0,
  updated: 0,
  deactivated: 0,
  aiTagged: 0,
  aiFailed: 0,
  digestNotified: 0,
};

if (!KSTARTUP_API_KEY) {
  console.log('[sync] KSTARTUP_API_KEY 없음 — 수집 생략(기존 데이터 유지).');
} else {
  let items;
  try {
    items = await fetchAllAnnouncements();
  } catch (error) {
    // 공공 API 장애 — 수집만 스킵하고 나머지 단계는 계속(기존 데이터 유지).
    console.log(`[sync] 수집 실패(기존 데이터 유지): ${String(error).slice(0, 200)}`);
    items = null;
  }
  if (items) {
    stats.fetched = items.length;
    for (const raw of items) {
      const mapped = mapItem(raw);
      if (!mapped) continue;
      const { sourceId, ...fields } = mapped;
      const base = {
        ...fields,
        source: 'KSTARTUP',
        sourceId,
        fetchedAt: new Date(),
        isActive: true,
      };
      const existing = await prisma.supportProgram.findUnique({
        where: { source_sourceId: { source: 'KSTARTUP', sourceId } },
        select: { id: true },
      });
      await prisma.supportProgram.upsert({
        where: { source_sourceId: { source: 'KSTARTUP', sourceId } },
        // 갱신: 원문·기간·상태만. AI 산출물(aiSummary/aiTaggedAt/industryTagIds/summary)은 보존.
        update: base,
        create: {
          ...base,
          summary: (fields.rawSummary ?? fields.title).slice(0, SUMMARY_MAX), // AI 전 폴백 요약
          industryTagIds: [], // 빈 배열 = 전 업종 대상(AI 태깅 전 기본값)
        },
      });
      if (existing) stats.updated += 1;
      else stats.created += 1;
    }
  }
}

// 마감 지난 수집 건 비활성화(삭제 아님 — 시드/수동 행은 대상 밖).
const deactivated = await prisma.supportProgram.updateMany({
  where: { source: 'KSTARTUP', isActive: true, applicationEndDate: { lt: new Date() } },
  data: { isActive: false },
});
stats.deactivated = deactivated.count;

// ── 2. AI 요약·업종 태깅 (신규/미처리 수집 건만) ───────────────────────────
const industries = await prisma.industry.findMany({ select: { id: true, name: true } });
const industryByName = new Map(industries.map((i) => [i.name, i.id]));
const industryNames = industries.map((i) => i.name);

async function aiSummarizeAndTag(program) {
  const prompt = [
    '다음은 정부 지원사업 공고다. 두 가지를 JSON 으로만 답하라(설명·코드펜스 금지).',
    '',
    `공고명: ${program.title}`,
    `주관: ${program.organization}`,
    `지원대상: ${program.targetAudience ?? '명시 없음'}`,
    `개요: ${(program.rawSummary ?? '').slice(0, 1500)}`,
    '',
    '출력 형식: {"summary": "...", "industryNames": ["..."]}',
    '규칙:',
    '- summary: 이 공고의 핵심(무엇을·누구에게 지원)을 80자 이내 한국어 한 줄로.',
    `- industryNames: 다음 업종 목록 안에서만 선택 — ${industryNames.join(', ')}`,
    '- 명확히 해당하는 업종만 0~3개 선택하라. 특정 업종에 한정되지 않는 전 업종 대상 공고면 반드시 빈 배열 []로 답하라. 억지로 채우지 마라.',
  ].join('\n');

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${AI_API_KEY}` },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('AI 응답 비어 있음');
  // 코드펜스·앞뒤 잡음에 관대하게 JSON 블록만 추출.
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) throw new Error('AI 응답에서 JSON 미발견');
  const parsed = JSON.parse(jsonText);
  const summary = String(parsed.summary ?? '').trim().slice(0, 80);
  if (!summary) throw new Error('AI summary 비어 있음');
  const tagIds = (Array.isArray(parsed.industryNames) ? parsed.industryNames : [])
    .map((name) => industryByName.get(String(name).trim()))
    .filter(Boolean) // 목록 밖 업종은 폐기
    .slice(0, 3);
  return { summary, tagIds };
}

if (!aiEnabled) {
  console.log(
    process.argv.includes('--no-ai')
      ? '[sync] --no-ai — AI 요약·태깅 생략(크레딧 소모 없음).'
      : '[sync] AI env 미비 — AI 요약·태깅 생략(원문 요약으로 동작).',
  );
} else {
  const pendingPrograms = await prisma.supportProgram.findMany({
    where: { source: 'KSTARTUP', isActive: true, aiTaggedAt: null },
    orderBy: { applicationEndDate: 'asc' },
    take: AI_BATCH_MAX,
    select: { id: true, title: true, organization: true, targetAudience: true, rawSummary: true },
  });
  for (const program of pendingPrograms) {
    let result = null;
    for (let attempt = 1; attempt <= 2 && !result; attempt++) {
      try {
        result = await aiSummarizeAndTag(program);
      } catch (error) {
        if (attempt === 2) {
          stats.aiFailed += 1; // aiSummary null 유지 — 다음 실행에서 재시도
          console.log(`[sync] AI 실패(원문 유지): ${program.title.slice(0, 30)} — ${String(error).slice(0, 120)}`);
        }
      }
    }
    if (result) {
      await prisma.supportProgram.update({
        where: { id: program.id },
        data: {
          aiSummary: result.summary,
          summary: result.summary, // 화면 계약(summary) 갱신 — 원문은 rawSummary 에 보존
          industryTagIds: result.tagIds,
          aiTaggedAt: new Date(),
        },
      });
      stats.aiTagged += 1;
    }
  }
}

// ── 3. 맞춤 공고 일일 요약 알림 (6단계, 2026-07-20) ─────────────────────────
// 동기화 직후 1회: 이번 실행에서 새로 등록되고 업종 태깅까지 된 공고를 회원 업종과 매칭해
// 회원당 하루(KST) 1건만 요약 알림을 남긴다. 빈 태그(전 업종 대상)는 스팸 방지를 위해 제외 —
// 명시적으로 내 업종에 해당하는 공고가 있을 때만 알린다. 태깅 실패 건은 다음 실행에서
// aiTaggedAt 재시도 대상이지만 createdAt 이 지난 실행이라 알림 대상엔 다시 들어오지 않는다(과알림 방지 우선).
const DIGEST_TITLE = '내 업종 맞춤 새 지원사업이 등록됐어요';
const newTagged = await prisma.supportProgram.findMany({
  where: {
    source: 'KSTARTUP',
    isActive: true,
    createdAt: { gte: runStartedAt },
    NOT: { industryTagIds: { isEmpty: true } },
  },
  select: { industryTagIds: true },
});
if (newTagged.length === 0) {
  console.log('[sync] 맞춤 알림: 이번 실행 신규 태깅 공고 없음 — 생략.');
} else {
  // 업종별 신규 공고 수 집계 → 해당 업종의 승인·활성 회원에게 건수 요약.
  const countByIndustry = new Map();
  for (const program of newTagged)
    for (const tagId of program.industryTagIds)
      countByIndustry.set(tagId, (countByIndustry.get(tagId) ?? 0) + 1);

  const members = await prisma.user.findMany({
    where: {
      approvedAt: { not: null },
      suspendedAt: null,
      withdrawnAt: null,
      deletedAt: null,
      company: { industryId: { in: [...countByIndustry.keys()] } },
    },
    select: { id: true, company: { select: { industryId: true } } },
  });

  // 하루 1건 dedupe — KST 오늘 0시 이후 같은 제목의 알림이 이미 있으면 건너뛴다(재실행 안전).
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kstDayStart = new Date(
    Math.floor((Date.now() + KST_OFFSET_MS) / 86_400_000) * 86_400_000 - KST_OFFSET_MS,
  );
  const alreadyNotified = await prisma.notification.findMany({
    where: {
      type: 'SYSTEM',
      title: DIGEST_TITLE,
      createdAt: { gte: kstDayStart },
      userId: { in: members.map((m) => m.id) },
    },
    select: { userId: true },
  });
  const alreadySet = new Set(alreadyNotified.map((n) => n.userId));

  const digestData = members
    .filter((m) => !alreadySet.has(m.id) && m.company)
    .map((m) => ({
      type: 'SYSTEM',
      title: DIGEST_TITLE,
      body: `회원님 업종에 맞는 새 지원사업 ${countByIndustry.get(m.company.industryId)}건이 올라왔어요. 마감 전에 확인해 보세요.`,
      linkUrl: '/support',
      userId: m.id,
    }));
  if (digestData.length > 0) await prisma.notification.createMany({ data: digestData });
  stats.digestNotified = digestData.length;
  console.log(
    `[sync] 맞춤 알림: 신규 태깅 ${newTagged.length}건 → 대상 회원 ${members.length}명, 발송 ${digestData.length}건(중복 제외 ${alreadySet.size}명).`,
  );
}

console.log('[sync] 완료:', JSON.stringify(stats));
const totals = await prisma.supportProgram.groupBy({ by: ['source', 'isActive'], _count: true });
console.log(
  '[sync] 현황:',
  JSON.stringify(totals.map((t) => ({ source: t.source ?? 'MANUAL(시드)', active: t.isActive, n: t._count }))),
);
await prisma.$disconnect();
