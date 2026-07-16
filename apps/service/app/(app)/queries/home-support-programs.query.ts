import 'server-only';

import { prisma } from '@mungsan/db';

// isActive 공고 중 홈에 노출할 개수.
const HOME_PROGRAM_TAKE = 3;

// 홈 "AI 맞춤 사업 공고" 1건 — 내 회사 업종(Company.industryId)이 공고의 매칭 업종에 들면 적합.
// canonical 값만 반환한다(Date 그대로). D-day 라벨·태그 표시는 ui가 만든다.
// [파생·근거없음] matchRate는 산정 모델이 없어 programId 해시로 결정론적 분산 — 같은 공고엔 항상 같은 값.
export type HomeSupportProgram = {
  id: string;
  title: string;
  summary: string;
  organization: string;
  matchRate: number; // 0~100, 적합 88~96 / 비적합 62~76
  industryMatched: boolean;
  applicationEndDate: Date | null;
};

export async function getHomeSupportProgramsQuery(userId: string): Promise<HomeSupportProgram[]> {
  const [company, programs] = await Promise.all([
    prisma.company.findUnique({ where: { userId }, select: { industryId: true } }),
    prisma.supportProgram.findMany({
      // 적합도는 뷰어 업종에 따라 파생돼 DB orderBy로 못 내린다 → 활성 공고를 넉넉히(상한 50)
      // 받아 아래에서 적합-우선 랭킹 후 상위 N만 slice. active 카탈로그가 작아 pushdown 문제 없음.
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        summary: true,
        organization: true,
        industryTagIds: true,
        applicationEndDate: true,
      },
    }),
  ]);

  const myIndustryId = company?.industryId ?? null;

  return programs
    .map((p) => {
      const industryMatched = myIndustryId != null && p.industryTagIds.includes(myIndustryId);
      return {
        id: p.id,
        title: p.title,
        summary: p.summary,
        organization: p.organization,
        matchRate: deriveMatchRate(p.id, industryMatched),
        industryMatched,
        applicationEndDate: p.applicationEndDate,
      };
    })
    // 적합 공고 우선, 그 안에서 적합도 높은 순. 상위 N만 노출.
    .sort(
      (a, b) =>
        Number(b.industryMatched) - Number(a.industryMatched) || b.matchRate - a.matchRate,
    )
    .slice(0, HOME_PROGRAM_TAKE);
}

// 적합 88~96(9단)·비적합 62~76(15단)으로 programId 해시 기반 결정론적 분산.
function deriveMatchRate(programId: string, industryMatched: boolean): number {
  const seed = fnv1a(programId);
  return industryMatched ? 88 + (seed % 9) : 62 + (seed % 15);
}

function fnv1a(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
