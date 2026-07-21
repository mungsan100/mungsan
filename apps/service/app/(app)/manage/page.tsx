import { Suspense } from 'react';
import { LuUserRound } from 'react-icons/lu';

import { AssetReportSection } from './ui/asset-report-section';
import { MyCardsSection } from './ui/my-cards-section';
import { MyInfoSection } from './ui/my-info-section';
import { MypageMenuGrid } from './ui/mypage-menu-grid';
import { TrustScoreCard } from './ui/trust-score-card';

// 내 정보(구 "관리", 2026-07-21 IA 재구성) — 프로필 카드 + 바로가기 4개(받은/보낸 제안·내가 쓴 글·
// 저장한 글, 각 별도 페이지) + 명함첩 + 신뢰 지수. 문의·설정(비번·닉네임·탈퇴·로그아웃)은 공통
// 상단 ☰ 더보기로 이관(IA 2차). 자산 리포트는 회원 개인 자료라 이 허브에 유지.
export default function ManagePage() {
  return (
    <>
      <header className="bg-canvas px-5 pt-12 pb-5">
        <div className="flex items-center gap-2">
          <LuUserRound className="text-ink-900 h-7 w-7" />
          <h1 className="text-ink-900 text-2xl font-bold">내 정보</h1>
        </div>
      </header>

      <div className="space-y-6 pb-24">
        {/* 신뢰 지수 — 전 버전처럼 맨 위(2026-07-22 결정). 지표별 올리는 방법 힌트 포함. */}
        <section className="px-5">
          <Suspense fallback={<CardSkeleton />}>
            <TrustScoreCard />
          </Suspense>
        </section>

        {/* 프로필 카드 — 개인정보·라운지 닉네임(표시)·회사 정보. */}
        <Suspense fallback={<ListSkeleton />}>
          <MyInfoSection />
        </Suspense>

        {/* 바로가기 4개 — 각각 별도 페이지. */}
        <section className="px-5">
          <MypageMenuGrid />
        </section>

        {/* 명함첩 — 촬영/업로드 → AI 인식 → 저장. */}
        <Suspense fallback={<ListSkeleton />}>
          <MyCardsSection />
        </Suspense>

        {/* 자산 리포트. */}
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
