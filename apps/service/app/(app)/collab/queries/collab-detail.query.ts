import 'server-only';

import { prisma } from '@mungsan/db';

// 협업 공고 상세 — 공고 전체 + 작성자 회사 프로필 + 뷰어 기준 북마크/본인 여부.
// canonical 값만 반환(Date·number·원시). 표시 포맷은 ui가 담당.
export type CollabDetail = {
  postId: string;
  title: string;
  description: string;
  minBudgetInCheonwon: number | null;
  maxBudgetInCheonwon: number | null;
  region: string | null;
  collaborationMethod: string | null;
  startDate: Date | null;
  endDate: Date | null;
  applicationDeadline: Date | null; // 신청 마감일 — 지났으면 제안 폼 대신 마감 안내
  requiredPartnerSkills: string[]; // requiredSkillIds → Skill명
  postIndustries: string[]; // industryTagIds → Industry명
  viewCount: number;
  proposalCount: number;
  bookmarkCount: number;
  bookmarked: boolean; // 현재 유저가 저장했는지
  isOwnPost: boolean; // 현재 유저가 작성자인지 → 제안 폼 숨김
  createdAt: Date;
  companyName: string;
  industryName: string | null;
  companyDescription: string | null;
  trackRecord: string | null;
  website: string | null;
  revenueInCheonwon: number | null;
  companyRegion: string | null; // 회사 소재 지역(목록 카드와 파리티)
  companyHeadcount: number | null; // 회사 임직원 수
  companyFoundedDate: Date | null; // 회사 설립일 → ui가 업력 파생
  capabilityTags: string[]; // 회사 capabilityIds → Skill명
  verified: boolean;
  attachments: { id: string; fileName: string; size: number | null }[]; // 공고 첨부(열람은 서명 URL 액션 경유)
};

export async function getCollabDetailQuery({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}): Promise<CollabDetail | null> {
  const post = await prisma.collaborationPost.findFirst({
    where: { id: postId, isPublic: true, deletedAt: null, hiddenAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      minBudgetInCheonwon: true,
      maxBudgetInCheonwon: true,
      region: true,
      collaborationMethod: true,
      startDate: true,
      endDate: true,
      applicationDeadline: true,
      requiredSkillIds: true,
      industryTagIds: true,
      viewCount: true,
      proposalCount: true,
      bookmarkCount: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          approvedAt: true,
          company: {
            select: {
              name: true,
              description: true,
              trackRecord: true,
              website: true,
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
      bookmarks: { where: { userId }, select: { id: true } },
    },
  });
  if (!post) return null;

  const company = post.author.company;
  const skillIds = [...new Set([...post.requiredSkillIds, ...(company?.capabilityIds ?? [])])];
  // Skill·Industry 이름 해석과 첨부 조회는 서로 독립 — 병렬로 출발시켜 직렬 워터폴을 없앤다.
  const [skills, industries, attachments] = await Promise.all([
    skillIds.length
      ? prisma.skill.findMany({ where: { id: { in: skillIds } }, select: { id: true, name: true } })
      : Promise.resolve<{ id: string; name: string }[]>([]),
    post.industryTagIds.length
      ? prisma.industry.findMany({
          where: { id: { in: post.industryTagIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve<{ id: string; name: string }[]>([]),
    prisma.attachment.findMany({
      where: { ownerType: 'COLLABORATION_POST', ownerId: post.id, kind: 'POST_ATTACHMENT' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, fileName: true, size: true },
    }),
  ]);
  const skillName = new Map(skills.map((s) => [s.id, s.name]));
  const industryName = new Map(industries.map((i) => [i.id, i.name]));
  const resolve = (ids: string[], m: Map<string, string>) =>
    ids.map((id) => m.get(id)).filter((n): n is string => n != null);

  return {
    postId: post.id,
    title: post.title,
    description: post.description,
    minBudgetInCheonwon: post.minBudgetInCheonwon,
    maxBudgetInCheonwon: post.maxBudgetInCheonwon,
    region: post.region,
    collaborationMethod: post.collaborationMethod,
    startDate: post.startDate,
    endDate: post.endDate,
    applicationDeadline: post.applicationDeadline,
    requiredPartnerSkills: resolve(post.requiredSkillIds, skillName),
    postIndustries: resolve(post.industryTagIds, industryName),
    viewCount: post.viewCount,
    proposalCount: post.proposalCount,
    bookmarkCount: post.bookmarkCount,
    bookmarked: post.bookmarks.length > 0,
    isOwnPost: post.author.id === userId,
    createdAt: post.createdAt,
    companyName: company?.name ?? post.author.name,
    industryName: company?.industry.name ?? null,
    companyDescription: company?.description ?? null,
    trackRecord: company?.trackRecord ?? null,
    website: company?.website ?? null,
    revenueInCheonwon: company?.revenueInCheonwon ?? null,
    companyRegion: company?.region ?? null,
    companyHeadcount: company?.headcount ?? null,
    companyFoundedDate: company?.foundedDate ?? null,
    capabilityTags: resolve(company?.capabilityIds ?? [], skillName),
    verified: post.author.approvedAt != null,
    attachments,
  };
}
