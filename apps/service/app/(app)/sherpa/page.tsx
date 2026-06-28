import { LuClock, LuZap } from 'react-icons/lu';

import { ScreenHeader } from '@/components/layout/screen-header';
import { SectionHeader } from '@/components/section-header';

import { insightCards, milestoneSteps, overallProgress, projectBanner } from './mock';
import { InsightCard } from './ui/insight-card';
import { MilestoneTimeline } from './ui/milestone-timeline';
import { ProjectBanner } from './ui/project-banner';
import { SherpaHeaderToggle } from './ui/sherpa-header-toggle';

export default function SherpaPage() {
  return (
    <>
      <ScreenHeader
        label="My 셰르파 가이드"
        title="공유 대시보드"
        right={<SherpaHeaderToggle />}
      >
        <ProjectBanner banner={projectBanner} />
      </ScreenHeader>

      <div className="space-y-6 py-5">
        <section className="px-5">
          <SectionHeader
            icon={<LuZap className="h-[18px] w-[18px]" />}
            title="셰르파 업무 요약"
          />
          <div className="mt-3 space-y-3">
            {insightCards.map((card) => (
              <InsightCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className="px-5">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={<LuClock className="h-[18px] w-[18px]" />}
              title="실시간 마일스톤"
            />
            <div className="text-ink-400 flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="bg-ink-800 h-1.5 w-1.5 rounded-full" /> 우리
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-brand h-1.5 w-1.5 rounded-full" /> 테크브릿지
              </span>
            </div>
          </div>
          <div className="mt-3">
            <MilestoneTimeline steps={milestoneSteps} progress={overallProgress} />
          </div>
        </section>
      </div>
    </>
  );
}
