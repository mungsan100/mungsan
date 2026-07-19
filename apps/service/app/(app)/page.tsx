import { Suspense } from 'react';

import { SectionHeader } from '@/components/section-header';

import { DecisionAlertSection } from './ui/decision-alert-section';
import { FundingNoticeSection } from './ui/funding-notice-section';
import { HomeGreeting } from './ui/home-greeting';
import { HomeHeader } from './ui/home-header';
import { HomeStatCards } from './ui/home-stat-cards';
import { NotificationBellCount } from './ui/notification-bell-count';
import { ProjectProgressSection } from './ui/project-progress-section';
import { UpcomingTasks } from './ui/upcoming-tasks';

// 홈 — 뭉산 브리핑 밝은 헤더 + 오늘의 협업 전략. 정적 셸에 동적 섹션을 국소 Suspense로 스트리밍한다.
export default function HomePage() {
  return (
    <>
      <HomeHeader
        greeting={
          <Suspense fallback={<GreetingSkeleton />}>
            <HomeGreeting />
          </Suspense>
        }
        bell={
          <Suspense fallback={<BellSkeleton />}>
            <NotificationBellCount />
          </Suspense>
        }
      />

      <div className="space-y-5 pb-5">
        <section className="px-5">
          <Suspense fallback={<StatCardsSkeleton />}>
            <HomeStatCards />
          </Suspense>
        </section>

        <section className="px-5">
          <Suspense fallback={<TasksSkeleton />}>
            <UpcomingTasks />
          </Suspense>
        </section>

        {/* 지원사업 2단(맞춤 추천 + 새 공고) — 제목에 회원 이름이 들어가 헤더까지 섹션 컴포넌트가 렌더. */}
        <section className="px-5">
          <Suspense fallback={<FundingSkeleton />}>
            <FundingNoticeSection />
          </Suspense>
        </section>

        <section className="px-5">
          <SectionHeader title="진행 중인 협업" action={{ label: 'MY 셰르파', href: '/sherpa' }} />
          <div className="mt-3">
            <Suspense fallback={<CardsSkeleton />}>
              <ProjectProgressSection />
            </Suspense>
          </div>
        </section>

        <section className="px-5">
          <SectionHeader title="의사결정 알림" />
          <div className="mt-3">
            <Suspense fallback={<CardsSkeleton />}>
              <DecisionAlertSection />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
}

const GreetingSkeleton = () => (
  <span className="bg-ink-100 inline-block h-5 w-40 animate-pulse rounded" />
);

const BellSkeleton = () => (
  <span className="bg-ink-100 inline-block h-10 w-10 animate-pulse rounded-full" />
);

const StatCardsSkeleton = () => (
  <div className="grid grid-cols-3 gap-2.5">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-ink-100 h-[74px] animate-pulse rounded-2xl" />
    ))}
  </div>
);

const TasksSkeleton = () => (
  <div>
    <div className="bg-ink-100 h-6 w-32 animate-pulse rounded" />
    <div className="mt-3 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-ink-100 h-[68px] animate-pulse rounded-2xl" />
      ))}
    </div>
  </div>
);

const CardsSkeleton = () => (
  <div className="space-y-3">
    {[0, 1].map((i) => (
      <div key={i} className="bg-ink-100 h-[84px] animate-pulse rounded-2xl" />
    ))}
  </div>
);

const FundingSkeleton = () => (
  <div className="space-y-5">
    {[0, 1].map((section) => (
      <div key={section}>
        <div className="bg-ink-100 h-6 w-44 animate-pulse rounded" />
        <div className="mt-3 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="bg-ink-100 h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    ))}
  </div>
);
