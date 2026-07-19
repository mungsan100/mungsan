import 'server-only';

import { prisma } from '@mungsan/db';

import { computeSupportMatch } from '@/lib/support/match-score';

const LIST_TAKE = 50; // 전체보기 상한 — 활성 공고 카탈로그 규모(수십 건)에 충분한 MVP 캡

// 지원사업 전체보기 목록 — 마감 임박순(마감 없는 공고는 뒤), 업종 칩 필터.
// 태그 빈 배열(전 업종 대상) 공고는 어떤 업종 필터에도 노출된다(결정 ③).
export type SupportProgramListItem = {
  id: string;
  title: string;
  summary: string;
  organization: string;
  matchRate: number;
  industryMatched: boolean;
  applicationEndDate: Date | null;
  region: string | null;
  detailUrl: string | null;
  hasAiSummary: boolean;
  industryNames: string[]; // 태그 업종명(표시용) — 빈 배열이면 "전 업종"
};

export async function getSupportProgramsQuery(
  userId: string,
  industryName?: string,
): Promise<SupportProgramListItem[]> {
  const industries = await prisma.industry.findMany({ select: { id: true, name: true } });
  const industryNameById = new Map(industries.map((i) => [i.id, i.name]));
  const filterId = industryName
    ? (industries.find((i) => i.name === industryName)?.id ?? null)
    : null;

  const [company, programs] = await Promise.all([
    prisma.company.findUnique({ where: { userId }, select: { industryId: true, region: true } }),
    prisma.supportProgram.findMany({
      // 마감 지난 공고 제외 — 수집 건은 동기화가 비활성화하지만 시드/수동 건은 여기서 거른다.
      // 업종 필터와 마감 조건이 각각 OR 라 최상위 키 충돌을 피해 AND 배열로 싣는다.
      where: {
        isActive: true,
        AND: [
          { OR: [{ applicationEndDate: null }, { applicationEndDate: { gte: new Date() } }] },
          ...(filterId
            ? [
                {
                  OR: [
                    { industryTagIds: { has: filterId } },
                    { industryTagIds: { isEmpty: true } },
                  ],
                },
              ]
            : []),
        ],
      },
      // 마감 임박순 — 마감 없는 공고는 목록 뒤로.
      orderBy: [{ applicationEndDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
      take: LIST_TAKE,
      select: {
        id: true,
        title: true,
        summary: true,
        organization: true,
        industryTagIds: true,
        applicationEndDate: true,
        region: true,
        detailUrl: true,
        aiSummary: true,
      },
    }),
  ]);

  const now = new Date();
  const viewer = { industryId: company?.industryId ?? null, region: company?.region ?? null };

  return programs.map((program) => {
    const { matchRate, industryMatched } = computeSupportMatch(program, viewer, now);
    return {
      id: program.id,
      title: program.title,
      summary: program.summary,
      organization: program.organization,
      matchRate,
      industryMatched,
      applicationEndDate: program.applicationEndDate,
      region: program.region,
      detailUrl: program.detailUrl,
      hasAiSummary: program.aiSummary != null,
      industryNames: program.industryTagIds
        .map((id) => industryNameById.get(id))
        .filter((name): name is string => name != null),
    };
  });
}

// 업종 칩 목록(카탈로그 전체) — 필터 UI 가 쓴다.
export async function getSupportIndustryNamesQuery(): Promise<string[]> {
  const industries = await prisma.industry.findMany({
    orderBy: { createdAt: 'asc' },
    select: { name: true },
  });
  return industries.map((i) => i.name);
}
