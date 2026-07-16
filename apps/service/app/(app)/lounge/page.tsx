import { Suspense } from 'react';

import { CategoryTabs } from './ui/category-tabs';
import { LoungeCategoryFilter } from './ui/lounge-category-filter';
import { LoungeFeed, type LoungeFeedSearchParams } from './ui/lounge-feed';
import { LoungeHeader } from './ui/lounge-header';
import { LoungeSearchBar } from './ui/lounge-search-bar';
import { TrendCard } from './ui/trend-card';
import { WriteFab } from './ui/write-fab';

// 라운지 — 밝은 헤더 + 검색 + 업종/카테고리 필터 칩 + 실시간 트렌드 + 최신 글 피드 + 글쓰기 FAB.
// cacheComponents: searchParams를 page 루트에서 await하지 않는다. promise를 Suspense 아래
// LoungeFeed로 내려 거기서 await하고, 필터 칩·검색바는 client에서 useSearchParams로 읽는다.
export default function LoungePage({
  searchParams,
}: {
  searchParams: Promise<LoungeFeedSearchParams>;
}) {
  return (
    <>
      <LoungeHeader />
      <div className="space-y-5 pb-24">
        <section className="space-y-3 px-5">
          <Suspense fallback={<SearchBarSkeleton />}>
            <LoungeSearchBar />
          </Suspense>
          <Suspense fallback={<FilterSkeleton />}>
            <CategoryTabs />
          </Suspense>
          <Suspense fallback={<FilterSkeleton />}>
            <LoungeCategoryFilter />
          </Suspense>
        </section>

        <section className="px-5">
          <Suspense fallback={<TrendSkeleton />}>
            <TrendCard />
          </Suspense>
        </section>

        <section className="space-y-3 px-5">
          <p className="text-ink-500 text-sm font-semibold">최신 글</p>
          <Suspense fallback={<FeedSkeleton />}>
            <LoungeFeed searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
      <WriteFab />
    </>
  );
}

const SearchBarSkeleton = () => <div className="bg-ink-100 h-12 animate-pulse rounded-xl" />;

const FilterSkeleton = () => (
  <div className="flex gap-2">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="bg-ink-100 h-9 w-16 animate-pulse rounded-full" />
    ))}
  </div>
);

const TrendSkeleton = () => <div className="bg-ink-100 h-40 animate-pulse rounded-2xl" />;

const FeedSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-ink-100 h-44 animate-pulse rounded-2xl" />
    ))}
  </div>
);
