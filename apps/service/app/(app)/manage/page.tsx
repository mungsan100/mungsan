import { Suspense } from 'react';
import { LuShieldCheck } from 'react-icons/lu';

import { AssetReportSection } from './ui/asset-report-section';
import { LoungeProfileSection } from './ui/lounge-profile-section';
import { ProposalSection } from './ui/proposal-section';
import { TrustScoreCard } from './ui/trust-score-card';

// 관리 — 밝은 헤더 + 신뢰 지수 + 받은 제안 + 자산 리포트. 각 비동기 섹션은 국소 Suspense로 스트리밍.
export default function ManagePage() {
  return (
    <>
      <header className="bg-canvas px-5 pt-12 pb-5">
        <div className="flex items-center gap-2">
          <LuShieldCheck className="text-ink-900 h-7 w-7" />
          <h1 className="text-ink-900 text-2xl font-bold">관리</h1>
        </div>
      </header>

      <div className="space-y-6 pb-24">
        <section className="px-5">
          <Suspense fallback={<CardSkeleton />}>
            <TrustScoreCard />
          </Suspense>
        </section>

        <section className="px-5">
          <Suspense fallback={<CardSkeleton />}>
            <LoungeProfileSection />
          </Suspense>
        </section>

        <Suspense fallback={<ListSkeleton />}>
          <ProposalSection />
        </Suspense>

        <Suspense fallback={<ListSkeleton />}>
          <AssetReportSection />
        </Suspense>
      </div>
    </>
  );
}

const CardSkeleton = () => <div className="bg-ink-100 h-64 animate-pulse rounded-2xl" />;

const ListSkeleton = () => (
  <div className="space-y-3 px-5">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-ink-100 h-24 animate-pulse rounded-2xl" />
    ))}
  </div>
);
