import { Suspense } from 'react';
import { LuShieldCheck } from 'react-icons/lu';

import { logoutAction } from '@/app/(auth)/pending/commands/logout.action';

import { AssetReportSection } from './ui/asset-report-section';
import { LoungeProfileSection } from './ui/lounge-profile-section';
import { MyInfoSection } from './ui/my-info-section';
import { ProposalSection } from './ui/proposal-section';
import { SentProposalSection } from './ui/sent-proposal-section';
import { TrustScoreCard } from './ui/trust-score-card';
import { WithdrawSection } from './ui/withdraw-section';

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

        <Suspense fallback={<ListSkeleton />}>
          <MyInfoSection />
        </Suspense>

        <section className="px-5">
          <Suspense fallback={<CardSkeleton />}>
            <LoungeProfileSection />
          </Suspense>
        </section>

        <Suspense fallback={<ListSkeleton />}>
          <ProposalSection />
        </Suspense>

        <Suspense fallback={<ListSkeleton />}>
          <SentProposalSection />
        </Suspense>

        <Suspense fallback={<ListSkeleton />}>
          <AssetReportSection />
        </Suspense>

        {/* 로그아웃 — 로그인 후 유일한 로그아웃 진입점(가입심사중 화면의 로그아웃과 같은 액션). */}
        <section className="px-5">
          <form action={logoutAction}>
            <button
              type="submit"
              className="border-ink-200 text-ink-500 hover:bg-ink-100 w-full rounded-xl border bg-white py-3 text-sm font-semibold"
            >
              로그아웃
            </button>
          </form>
        </section>

        <section className="px-5">
          <WithdrawSection />
        </section>
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
