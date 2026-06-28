import { LuCircleAlert, LuClock, LuSparkles, LuZap } from 'react-icons/lu';

import { ScreenHeader } from '@/components/layout/screen-header';
import { SectionHeader } from '@/components/section-header';

import { decisions, fundingNotices, headerStats, projects } from './ui/mock';
import { DecisionAlertCard } from './ui/decision-alert-card';
import { FundingNoticeCard } from './ui/funding-notice-card';
import { HeaderStats } from './ui/header-stats';
import { NotificationBell } from './ui/notification-bell';
import { ProjectProgressCard } from './ui/project-progress-card';

export default function HomePage() {
  return (
    <>
      <ScreenHeader
        right={<NotificationBell count={3} />}
        title={
          <span className="block">
            <span className="ring-1 ring-white/15 mb-6 flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white">
              <LuSparkles className="h-3.5 w-3.5" />
              AI 브리핑
            </span>
            <span className="block text-[14px] font-medium text-white/70">
              안녕하세요, 김대표님 👋
            </span>
            <span className="mt-1 block text-[26px] leading-tight font-bold">
              오늘의 협업 전략입니다
            </span>
          </span>
        }
      >
        <HeaderStats stats={headerStats} />
      </ScreenHeader>

      <div className="space-y-6 py-5">
        <section className="px-5">
          <SectionHeader
            icon={<LuZap className="h-[18px] w-[18px]" />}
            title="AI 맞춤 사업 공고"
            action={{ label: '전체보기' }}
          />
          <div className="mt-3 space-y-3">
            {fundingNotices.map((notice) => (
              <FundingNoticeCard key={notice.title} notice={notice} />
            ))}
          </div>
        </section>

        <section className="px-5">
          <SectionHeader
            icon={<LuClock className="h-[18px] w-[18px]" />}
            title="진행 현황 요약"
            action={{ label: '상세보기' }}
          />
          <div className="mt-3 space-y-3">
            {projects.map((project) => (
              <ProjectProgressCard key={project.title} project={project} />
            ))}
          </div>
        </section>

        <section className="px-5">
          <SectionHeader
            icon={<LuCircleAlert className="h-[18px] w-[18px]" />}
            title="의사결정 알림"
          />
          <div className="mt-3 space-y-3">
            {decisions.map((alert) => (
              <DecisionAlertCard key={alert.title} alert={alert} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
