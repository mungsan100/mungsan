import 'server-only';

import { prisma } from '@mungsan/db';

// 협업 마켓플레이스 카드 1건 — 공고(CollaborationPost) + 작성자 회사(Company) 조인.
// canonical 값만 반환한다(Date·number·원시 문자열). 업력 등 표시 포맷은 ui가 만든다.
export type PartnerCard = {
  postId: string;
  companyName: string; // 회사 없으면 작성자 이름 폴백
  industryName: string | null;
  verified: boolean; // 작성자 승인(approvedAt) 여부
  companyDescription: string | null;
  postDescription: string;
  revenueInCheonwon: number | null;
  region: string | null; // 회사 소재 지역(선택 공개)
  headcount: number | null; // 회사 임직원 수(선택 공개)
  foundedDate: Date | null; // 회사 설립일 → ui가 업력("N년차") 파생
  capabilityTags: string[]; // 회사 capabilityIds → Skill명
  requiredPartnerSkills: string[]; // 공고 requiredSkillIds → Skill명
  startDate: Date | null;
  endDate: Date | null;
  applicationDeadline: Date | null; // 신청 마감일 — ui가 "마감"/"D-n" 배지 파생
  // 적합도(0~100) — 뷰어 회사와 공고의 업종·역량 겹침으로 파생. 뷰어 회사가 없으면 null.
  matchRate: number | null;
};

// 예산 밴드(천 원 단위) — PRD "예산" 필터. 공고의 min~max 구간과 밴드가 겹치면 매치.
export const BUDGET_BANDS = {
  u10000: { label: '1천만 미만', min: 0, max: 9999 },
  b10000: { label: '1천만~5천만', min: 10000, max: 50000 },
  b50000: { label: '5천만~1억', min: 50000, max: 100000 },
  o100000: { label: '1억 이상', min: 100000, max: null },
} as const;
export type BudgetBand = keyof typeof BUDGET_BANDS;

// 기간 밴드(개월) — 협업 기간(startDate~endDate) 길이 기준. 기간 미기재 공고는 필터 시 제외.
export const DURATION_BANDS = {
  u1: { label: '1개월 이하', min: 0, max: 1 },
  b1: { label: '1~3개월', min: 1, max: 3 },
  b3: { label: '3~6개월', min: 3, max: 6 },
  o6: { label: '6개월 이상', min: 6, max: null },
} as const;
export type DurationBand = keyof typeof DURATION_BANDS;

export type CollabMarketplaceQuery = {
  viewerUserId: string;
  q?: string;
  industryId?: string;
  skillId?: string; // 필요 역량 필터(requiredSkillIds 포함 여부)
  region?: string; // 지역 필터(공고 region 정확 일치)
  budget?: BudgetBand;
  duration?: DurationBand;
  openOnly?: boolean; // 협업 가능 상태 — 모집중(마감 전)만
  deadlineSoon?: boolean; // 마감 임박 — 7일 이내
  sort?: 'latest' | 'recommended'; // 추천순 = 적합도(matchRate) 내림차순
};

export async function getCollabMarketplaceQuery({
  viewerUserId,
  q,
  industryId,
  skillId,
  region,
  budget,
  duration,
  openOnly,
  deadlineSoon,
  sort,
}: CollabMarketplaceQuery): Promise<PartnerCard[]> {
  // 적합도 계산 기준(뷰어 회사)과 공고 목록은 서로 독립 — 병렬로 출발시켜 직렬 워터폴을 없앤다.
  // 회사가 없으면 viewer는 null(적합도 미노출).
  const viewerPromise = prisma.company.findUnique({
    where: { userId: viewerUserId },
    select: { industryId: true, capabilityIds: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soonLimit = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  soonLimit.setHours(23, 59, 59, 999);
  const budgetBand = budget ? BUDGET_BANDS[budget] : null;

  // OR 를 쓰는 조건이 여럿(모집중·예산·검색)이라 최상위 키 충돌을 피해 전부 AND 배열로 합친다.
  const andConditions: object[] = [];
  // 협업 가능 상태(모집중) — 마감일 없거나 아직 안 지남
  if (openOnly)
    andConditions.push({ OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: today } }] });
  // 마감 임박 — 오늘부터 7일 이내 마감
  if (deadlineSoon) andConditions.push({ applicationDeadline: { gte: today, lte: soonLimit } });
  // 예산 — 공고의 min~max 구간과 선택 밴드가 겹침(예산 미기재 공고는 제외)
  if (budgetBand) {
    andConditions.push({
      NOT: { AND: [{ minBudgetInCheonwon: null }, { maxBudgetInCheonwon: null }] },
    });
    andConditions.push({
      OR: [{ maxBudgetInCheonwon: null }, { maxBudgetInCheonwon: { gte: budgetBand.min } }],
    });
    if (budgetBand.max != null)
      andConditions.push({
        OR: [{ minBudgetInCheonwon: null }, { minBudgetInCheonwon: { lte: budgetBand.max } }],
      });
  }
  if (q)
    andConditions.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { author: { company: { name: { contains: q, mode: 'insensitive' } } } },
        { author: { company: { industry: { name: { contains: q, mode: 'insensitive' } } } } },
      ],
    });

  const postsPromise = prisma.collaborationPost.findMany({
    where: {
      isPublic: true,
      deletedAt: null,
      hiddenAt: null,
      // 산업축 필터 = 작성자 회사의 업종(카드가 노출하는 정체성 축)
      ...(industryId ? { author: { company: { industryId } } } : {}),
      // 필요 역량 — 공고가 선언한 requiredSkillIds에 포함
      ...(skillId ? { requiredSkillIds: { has: skillId } } : {}),
      // 지역 — 공고의 활동 지역 정확 일치(옵션 목록도 실데이터 distinct에서 나옴)
      ...(region ? { region } : {}),
      ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true,
      description: true,
      requiredSkillIds: true,
      industryTagIds: true,
      startDate: true,
      endDate: true,
      applicationDeadline: true,
      author: {
        select: {
          name: true,
          approvedAt: true,
          company: {
            select: {
              name: true,
              description: true,
              revenueInCheonwon: true,
              region: true,
              headcount: true,
              foundedDate: true,
              capabilityIds: true,
              industry: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  const [viewer, posts] = await Promise.all([viewerPromise, postsPromise]);

  // Skill명 일괄 해석 — 공고 requiredSkillIds + 회사 capabilityIds를 한 번에 조회(N+1 방지).
  const skillIds = [
    ...new Set(
      posts.flatMap((p) => [...p.requiredSkillIds, ...(p.author.company?.capabilityIds ?? [])]),
    ),
  ];
  const skills = skillIds.length
    ? await prisma.skill.findMany({ where: { id: { in: skillIds } }, select: { id: true, name: true } })
    : [];
  const skillName = new Map(skills.map((s) => [s.id, s.name]));
  const namesOf = (ids: string[]) =>
    ids.map((id) => skillName.get(id)).filter((n): n is string => n != null);

  const cards = posts.map((p): PartnerCard => {
    const company = p.author.company;
    return {
      postId: p.id,
      companyName: company?.name ?? p.author.name,
      industryName: company?.industry.name ?? null,
      verified: p.author.approvedAt != null,
      companyDescription: company?.description ?? null,
      postDescription: p.description,
      revenueInCheonwon: company?.revenueInCheonwon ?? null,
      region: company?.region ?? null,
      headcount: company?.headcount ?? null,
      foundedDate: company?.foundedDate ?? null,
      capabilityTags: namesOf(company?.capabilityIds ?? []),
      requiredPartnerSkills: namesOf(p.requiredSkillIds),
      startDate: p.startDate,
      endDate: p.endDate,
      applicationDeadline: p.applicationDeadline,
      matchRate: computeMatchRate(viewer, {
        industryTagIds: p.industryTagIds,
        requiredSkillIds: p.requiredSkillIds,
      }),
    };
  });

  // 기간(개월) 필터 — 필드 간 비교라 DB where 불가, 목록 규모(≤30)가 작아 앱단 필터.
  // 기간 미기재(시작/종료 중 하나라도 없음) 공고는 기간 필터 시 제외.
  const durationBand = duration ? DURATION_BANDS[duration] : null;
  const filtered = durationBand
    ? cards.filter((c) => {
        if (!c.startDate || !c.endDate) return false;
        const months = (c.endDate.getTime() - c.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
        return months >= durationBand.min && (durationBand.max == null || months <= durationBand.max);
      })
    : cards;

  // 추천순 — 적합도(matchRate) 내림차순, 미계산(null)은 뒤로. 기본은 최신순(쿼리 orderBy).
  if (sort === 'recommended')
    filtered.sort((a, b) => (b.matchRate ?? -1) - (a.matchRate ?? -1));

  return filtered;
}

// 지역 필터 옵션 — 실데이터에 존재하는 지역만(distinct). 공개·미삭제·미숨김 공고 기준.
export async function getCollabRegionsQuery(): Promise<string[]> {
  const rows = await prisma.collaborationPost.findMany({
    where: { isPublic: true, deletedAt: null, hiddenAt: null, region: { not: null } },
    distinct: ['region'],
    select: { region: true },
    orderBy: { region: 'asc' },
  });
  return rows.map((r) => r.region).filter((r): r is string => !!r);
}

// 적합도(0~100) — 뷰어 회사 업종이 공고 업종축에 포함되면 40점, 공고 필요역량 중 뷰어 보유역량
// 비율에 60점을 배분해 합산. 뷰어 회사가 없으면 계산 불가 → null.
function computeMatchRate(
  viewer: { industryId: string; capabilityIds: string[] } | null,
  post: { industryTagIds: string[]; requiredSkillIds: string[] },
): number | null {
  if (!viewer) return null;
  const industryScore = post.industryTagIds.includes(viewer.industryId) ? 40 : 0;
  const capabilitySet = new Set(viewer.capabilityIds);
  const matched = post.requiredSkillIds.filter((id) => capabilitySet.has(id)).length;
  const skillScore =
    post.requiredSkillIds.length > 0 ? (matched / post.requiredSkillIds.length) * 60 : 0;
  return Math.round(industryScore + skillScore);
}

export async function getCollabPostCountQuery(): Promise<number> {
  return prisma.collaborationPost.count({ where: { isPublic: true, deletedAt: null, hiddenAt: null } });
}
