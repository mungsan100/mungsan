// 지원사업 적합도 산식 — 홈 카드와 전체보기 목록이 공용으로 쓰는 순수 함수.
// 근거 있는 규칙 기반(AI 불필요 — AI 만료 후에도 동작):
//   업종 60 (명시 일치 60 / 전 업종 대상(태그 빈 배열) 40 / 불일치 0)
// + 마감 임박 20 (D-7 이내 20 / D-14 15 / D-30 10 / 마감일 있음 5 / 없음 0)
// + 지역 20 (전국(지역 미명시 포함) 20 / 내 회사 지역과 일치 20 / 불일치 0)

export type SupportMatchInput = {
  industryTagIds: string[];
  applicationEndDate: Date | null;
  region: string | null;
};

export type SupportMatchViewer = {
  industryId: string | null;
  region: string | null;
};

export type SupportMatch = {
  matchRate: number; // 0~100
  industryMatched: boolean; // 업종 명시 일치(전 업종 대상은 false)
};

export function computeSupportMatch(
  program: SupportMatchInput,
  viewer: SupportMatchViewer,
  now: Date = new Date(),
): SupportMatch {
  const { industryScore, industryMatched } = scoreIndustry(
    program.industryTagIds,
    viewer.industryId,
  );
  const matchRate =
    industryScore +
    scoreDeadline(program.applicationEndDate, now) +
    scoreRegion(program.region, viewer.region);
  return { matchRate, industryMatched };
}

// 업종 60점 축 — 태그 빈 배열은 "전 업종 대상"(모든 업종에 기본 노출, 명시 일치보다는 낮게).
function scoreIndustry(
  tagIds: string[],
  myIndustryId: string | null,
): { industryScore: number; industryMatched: boolean } {
  if (tagIds.length === 0) return { industryScore: 40, industryMatched: false };
  if (myIndustryId != null && tagIds.includes(myIndustryId))
    return { industryScore: 60, industryMatched: true };
  return { industryScore: 0, industryMatched: false };
}

// 마감 임박 20점 축 — 가까울수록 높게, 마감 지난 건 0(수집기가 비활성화하지만 방어).
function scoreDeadline(endDate: Date | null, now: Date): number {
  if (!endDate) return 0;
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (daysLeft < 0) return 0;
  if (daysLeft <= 7) return 20;
  if (daysLeft <= 14) return 15;
  if (daysLeft <= 30) return 10;
  return 5;
}

// 지역 20점 축 — 공고에 지역 명시가 없거나 "전국"이면 누구에게나 20, 명시 지역은 내 지역 포함 시 20.
// 회사 지역은 "서울 강남" 형태라 앞 2글자(시·도)로 느슨하게 대조한다.
function scoreRegion(programRegion: string | null, companyRegion: string | null): number {
  if (!programRegion || programRegion.includes('전국')) return 20;
  if (companyRegion && programRegion.includes(companyRegion.slice(0, 2))) return 20;
  return 0;
}
