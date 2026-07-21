import { Suspense } from 'react';
import { LuUserRound } from 'react-icons/lu';

import { logoutAction } from '@/app/(auth)/pending/commands/logout.action';

import { AssetReportSection } from './ui/asset-report-section';
import { InquirySection } from './ui/inquiry-section';
import { MyInfoSection } from './ui/my-info-section';
import { MypageMenuGrid } from './ui/mypage-menu-grid';
import { TrustScoreCard } from './ui/trust-score-card';
import { WithdrawSection } from './ui/withdraw-section';

// 내 정보(구 "관리", 2026-07-21 IA 1차) — 프로필 카드 상단 + 바로가기 4개(받은/보낸 제안·내가 쓴 글·
// 저장한 글, 각 별도 페이지) + 신뢰 지수. 자산 리포트·문의·로그아웃·탈퇴는 2차(더보기·설정) 전까지 하단 유지.
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
        {/* 프로필 카드 — 개인정보·라운지 닉네임·회사 정보·비밀번호 변경(정보 수정 진입점). */}
        <Suspense fallback={<ListSkeleton />}>
          <MyInfoSection />
        </Suspense>

        {/* 바로가기 4개 — 각각 별도 페이지로 이동. */}
        <section className="px-5">
          <MypageMenuGrid />
        </section>

        {/* 신뢰 지수 — 하단 유지. */}
        <section className="px-5">
          <Suspense fallback={<CardSkeleton />}>
            <TrustScoreCard />
          </Suspense>
        </section>

        <Suspense fallback={<ListSkeleton />}>
          <AssetReportSection />
        </Suspense>

        {/* 문의하기 — 운영팀 연락 창구(정적이라 Suspense 불필요). */}
        <InquirySection />

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
