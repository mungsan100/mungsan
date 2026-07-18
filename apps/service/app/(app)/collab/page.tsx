import { Suspense } from 'react';
import { LuRocket } from 'react-icons/lu';

import { CategoryFilterSection } from './ui/category-filter-section';
import { CollabCount } from './ui/collab-count';
import { CollabSearchBar } from './ui/collab-search-bar';
import { CollabWriteFab } from './ui/collab-write-fab';
import { FilterBarSection } from './ui/filter-bar-section';
import { MarketplaceFeed } from './ui/marketplace-feed';

// 협업 마켓플레이스 — 밝은 헤더(로켓 + 실 count) · 실 검색 · 산업축 탭 · 파트너 카드 리스트.
// cacheComponents: searchParams를 page 루트에서 await하지 않는다(정적 셸 보호). promise를 Suspense
// 아래 MarketplaceFeed로 내려 거기서 await하고, 검색·필터 칩은 client에서 useSearchParams로 읽는다.
export default function CollabPage({
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
}) {
  return (
    <>
      <header className="bg-canvas px-5 pt-12 pb-6">
        <div className="flex items-center gap-2">
          <LuRocket className="text-brand h-7 w-7" />
          <h1 className="text-ink-900 text-[26px] font-bold">협업 마켓플레이스</h1>
        </div>
        <Suspense fallback={<CountSkeleton />}>
          <CollabCount />
        </Suspense>
        <Suspense fallback={<SearchSkeleton />}>
          <CollabSearchBar />
        </Suspense>
        <Suspense fallback={<FilterSkeleton />}>
          <CategoryFilterSection />
        </Suspense>
        <Suspense fallback={<FilterSkeleton />}>
          <FilterBarSection />
        </Suspense>
      </header>

      <div className="px-5 pt-5 pb-24">
        <Suspense fallback={<FeedSkeleton />}>
          <MarketplaceFeed searchParams={searchParams} />
        </Suspense>
      </div>
      <CollabWriteFab />
    </>
  );
}

const CountSkeleton = () => <span className="bg-ink-100 mt-1 block h-4 w-16 animate-pulse rounded" />;

const SearchSkeleton = () => <div className="bg-ink-100 mt-4 h-11 animate-pulse rounded-xl" />;

const FilterSkeleton = () => (
  <div className="mt-4 flex gap-2">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="bg-ink-100 h-9 w-16 animate-pulse rounded-full" />
    ))}
  </div>
);

const FeedSkeleton = () => (
  <div className="space-y-4">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-ink-100 h-64 animate-pulse rounded-2xl" />
    ))}
  </div>
);
