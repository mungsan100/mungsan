import { Suspense } from 'react';

import { CategoryTabs } from './ui/category-tabs';
import { LoungeFeed } from './ui/lounge-feed';
import { LoungeHeader } from './ui/lounge-header';
import { TrendCard } from './ui/trend-card';
import { WriteFab } from './ui/write-fab';

// 라운지 — 밝은 헤더 + 산업축 필터 칩 + 실시간 트렌드 + 최신 글 피드 + 글쓰기 FAB.
// cacheComponents: searchParams를 page 루트에서 await하지 않는다. promise를 Suspense 아래
// LoungeFeed로 내려 거기서 await하고, 필터 칩은 client에서 useSearchParams로 읽는다.
export default function LoungePage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  return (
    <>
      <LoungeHeader />
      <div className="space-y-5 pb-24">
        <section className="px-5">
          <Suspense fallback={<FilterSkeleton />}>
            <CategoryTabs />
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
