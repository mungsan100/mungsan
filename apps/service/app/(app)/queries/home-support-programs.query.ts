import 'server-only';

import { prisma } from '@mungsan/db';

import { computeSupportMatch } from '@/lib/support/match-score';

// isActive 공고 중 홈에 노출할 개수.
const HOME_PROGRAM_TAKE = 3;

// 홈 "AI 맞춤 사업 공고" — 내 회사(업종·지역)와 공고를 매칭해 적합도를 산정한다.
// 산식은 lib/support/match-score(전체보기 목록과 공용) 참고 — 규칙 기반이라 AI 만료 후에도 동작.
// canonical 값만 반환한다(Date 그대로). D-day 라벨·태그 표시는 ui가 만든다.
export type HomeSupportProgram = {
  id: string;
  title: string;
  summary: string;
  organization: string;
  matchRate: number; // 0~100 — 위 산식의 합
  industryMatched: boolean; // 업종 명시 일치(전 업종 대상은 false — "업종 적합" 태그는 명시 일치만)
  applicationEndDate: Date | null;
  detailUrl: string | null; // 원문 공고 페이지(수집 건) — 없으면 링크 미표시
  hasAiSummary: boolean; // AI 요약 여부 — "AI 요약" 배지 표시용
};

export async function getHomeSupportProgramsQuery(userId: string): Promise<HomeSupportProgram[]> {
  const [company, programs] = await Promise.all([
    prisma.company.findUnique({ where: { userId }, select: { industryId: true, region: true } }),
    prisma.supportProgram.findMany({
      // 적합도는 뷰어 업종·지역에 따라 파생돼 DB orderBy로 못 내린다 → 활성 공고를 넉넉히(상한 50)
      // 받아 아래에서 랭킹 후 상위 N만 slice. active 카탈로그가 작아 pushdown 문제 없음.
      // 마감 지난 공고는 제외 — 수집 건은 동기화가 비활성화하지만 시드/수동 건은 여기서 거른다.
      where: {
        isActive: true,
        OR: [{ applicationEndDate: null }, { applicationEndDate: { gte: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
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

  return programs
    .map((program) => {
      const { matchRate, industryMatched } = computeSupportMatch(program, viewer, now);
      return {
        id: program.id,
        title: program.title,
        summary: program.summary,
        organization: program.organization,
        matchRate,
        industryMatched,
        applicationEndDate: program.applicationEndDate,
        detailUrl: program.detailUrl,
        hasAiSummary: program.aiSummary != null,
      };
    })
    // 적합도 높은 순, 동률이면 마감 임박 순(마감 없는 공고는 뒤).
    .sort(
      (a, b) =>
        b.matchRate - a.matchRate ||
        (a.applicationEndDate?.getTime() ?? Infinity) -
          (b.applicationEndDate?.getTime() ?? Infinity),
    )
    .slice(0, HOME_PROGRAM_TAKE);
}
