import { getCurrentUser } from '@/lib/auth/get-current-user';

import {
  BUDGET_BANDS,
  DURATION_BANDS,
  getCollabMarketplaceQuery,
  type BudgetBand,
  type DurationBand,
} from '../queries/collab-marketplace.query';
import { PartnerCard } from './partner-card';

// 마켓플레이스 피드 — searchParams(promise)를 여기서 await(cacheComponents 정적 셸 보호)해
// 검색·필터 파라미터를 파싱하고 필터한 파트너 목록을 렌더한다. 첫 카드는 추천 최우선(featured)로 강조.
// 뷰어(현재 유저) 기준 적합도를 계산하려 userId를 query에 넘긴다.
export const MarketplaceFeed = async ({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    industry?: string;
    skill?: string;
    region?: string;
    budget?: string;
    duration?: string;
    status?: string;
    deadline?: string;
    sort?: string;
  }>;
}) => {
  const { q, industry, skill, region, budget, duration, status, deadline, sort } =
    await searchParams;
  const user = await getCurrentUser();
  const partners = await getCollabMarketplaceQuery({
    viewerUserId: user.id,
    q: q?.trim() || undefined,
    industryId: industry || undefined,
    skillId: skill || undefined,
    region: region || undefined,
    budget: budget && budget in BUDGET_BANDS ? (budget as BudgetBand) : undefined,
    duration: duration && duration in DURATION_BANDS ? (duration as DurationBand) : undefined,
    openOnly: status === 'open',
    deadlineSoon: deadline === 'soon',
    sort: sort === 'recommended' ? 'recommended' : 'latest',
  });

  if (partners.length === 0)
    return (
      <p className="text-ink-400 py-16 text-center text-sm">조건에 맞는 협업 파트너가 없습니다.</p>
    );

  const [featured, ...rest] = partners;
  return (
    <div className="space-y-4">
      <PartnerCard partner={featured} featured />
      {rest.map((p) => (
        <PartnerCard key={p.postId} partner={p} />
      ))}
    </div>
  );
};
