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

export type CollabMarketplaceQuery = { viewerUserId: string; q?: string; industryId?: string };

export async function getCollabMarketplaceQuery({
  viewerUserId,
  q,
  industryId,
}: CollabMarketplaceQuery): Promise<PartnerCard[]> {
  // 적합도 계산 기준(뷰어 회사)과 공고 목록은 서로 독립 — 병렬로 출발시켜 직렬 워터폴을 없앤다.
  // 회사가 없으면 viewer는 null(적합도 미노출).
  const viewerPromise = prisma.company.findUnique({
    where: { userId: viewerUserId },
    select: { industryId: true, capabilityIds: true },
  });

  const postsPromise = prisma.collaborationPost.findMany({
    where: {
      isPublic: true,
      deletedAt: null,
      hiddenAt: null,
      // 산업축 필터 = 작성자 회사의 업종(카드가 노출하는 정체성 축)
      ...(industryId ? { author: { company: { industryId } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { author: { company: { name: { contains: q, mode: 'insensitive' } } } },
              { author: { company: { industry: { name: { contains: q, mode: 'insensitive' } } } } },
            ],
          }
        : {}),
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

  return posts.map((p) => {
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
