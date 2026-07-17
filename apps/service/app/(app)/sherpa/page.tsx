import { Suspense } from 'react';
import { LuFlag, LuListChecks, LuZap } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';

import { InsightSection } from './ui/insight-section';
import { MilestoneSection } from './ui/milestone-section';
import { ProjectBanner } from './ui/project-banner';
import { SherpaHeader } from './ui/sherpa-header';
import { TaskSection } from './ui/task-section';

// My 셰르파 — 밝은 헤더 + 프로젝트 배너 + 업무 요약 인사이트 + 할 일 목록 + 마일스톤 타임라인.
// 각 fetch 섹션을 독립 Suspense로 감싸 국소 스켈레톤으로 스트리밍한다.
export default function SherpaPage() {
  return (
    <>
      <SherpaHeader />

      <div className="space-y-6 pb-24">
        <section className="px-5">
          <Suspense fallback={<BannerSkeleton />}>
            <ProjectBanner />
          </Suspense>
        </section>

        <section className="space-y-3 px-5">
          <SectionHeader icon={<LuZap className="h-[18px] w-[18px]" />} title="셰르파 업무 요약" />
          <Suspense fallback={<InsightSkeleton />}>
            <InsightSection />
          </Suspense>
        </section>

        <section className="space-y-3 px-5">
          <SectionHeader icon={<LuListChecks className="h-[18px] w-[18px]" />} title="할 일" />
          <Suspense fallback={<InsightSkeleton />}>
            <TaskSection />
          </Suspense>
        </section>

        <section className="space-y-3 px-5">
          <SectionHeader icon={<LuFlag className="h-[18px] w-[18px]" />} title="마일스톤" />
          <Suspense fallback={<MilestoneSkeleton />}>
            <MilestoneSection />
          </Suspense>
        </section>
      </div>
    </>
  );
}

const BannerSkeleton = () => <div className="bg-ink-100 h-44 animate-pulse rounded-2xl" />;

const InsightSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-ink-100 h-20 animate-pulse rounded-2xl" />
    ))}
  </div>
);

const MilestoneSkeleton = () => (
  <div className="space-y-3">
    <div className="bg-ink-100 h-10 animate-pulse rounded-full" />
    <div className="bg-ink-100 h-80 animate-pulse rounded-2xl" />
  </div>
);
