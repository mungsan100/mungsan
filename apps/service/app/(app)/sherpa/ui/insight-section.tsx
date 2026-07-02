import type { IconType } from 'react-icons';
import { LuCircleCheck, LuClock, LuTrendingUp, LuTriangleAlert, LuTarget } from 'react-icons/lu';

import type { SherpaInsightsView } from '../queries/sherpa-insights.query';
import { getSherpaInsightsQuery } from '../queries/sherpa-insights.query';
import { InsightCard, type InsightTone } from './insight-card';

// 파생 인사이트를 fetch해 일정/속도/마일스톤 카드로 표시하는 RSC 경계.
export const InsightSection = async () => {
  const insights = await getSherpaInsightsQuery();
  const cards = buildInsightCards(insights);

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <InsightCard
          key={card.key}
          tone={card.tone}
          icon={card.icon}
          title={card.title}
          description={card.description}
        />
      ))}
    </div>
  );
};

type InsightCardModel = {
  key: string;
  tone: InsightTone;
  icon: IconType;
  title: string;
  description: string;
};

function buildInsightCards(insights: SherpaInsightsView): InsightCardModel[] {
  return [scheduleCard(insights), velocityCard(insights), milestoneCard(insights)];
}

// 일정 — 지연이 최우선, 다음으로 임박 마감, 둘 다 없으면 양호.
function scheduleCard({ overdueCount, dueSoonCount }: SherpaInsightsView): InsightCardModel {
  if (overdueCount > 0) {
    return {
      key: 'schedule',
      tone: 'warning',
      icon: LuTriangleAlert,
      title: `지연된 업무 ${overdueCount}건`,
      description: '마감일이 지난 미완료 업무가 있어요. 우선 처리가 필요합니다.',
    };
  }
  if (dueSoonCount > 0) {
    return {
      key: 'schedule',
      tone: 'brand',
      icon: LuClock,
      title: `이번 주 마감 ${dueSoonCount}건`,
      description: '7일 이내 마감 예정 업무가 있어요. 일정을 확인하세요.',
    };
  }
  return {
    key: 'schedule',
    tone: 'success',
    icon: LuCircleCheck,
    title: '일정이 안정적입니다',
    description: '지연되거나 임박한 마감이 없어요.',
  };
}

// 속도 — 최근 7일 완료 건수.
function velocityCard({ completedThisWeek }: SherpaInsightsView): InsightCardModel {
  return {
    key: 'velocity',
    tone: completedThisWeek > 0 ? 'brand' : 'warning',
    icon: LuTrendingUp,
    title: `이번 주 ${completedThisWeek}건 완료`,
    description:
      completedThisWeek > 0
        ? '업무를 꾸준히 마무리하고 있어요.'
        : '이번 주 완료된 업무가 아직 없어요.',
  };
}

// 마일스톤 — 전체 진행률.
function milestoneCard({ progressPercentage }: SherpaInsightsView): InsightCardModel {
  return {
    key: 'milestone',
    tone: progressPercentage >= 100 ? 'success' : 'brand',
    icon: LuTarget,
    title: `전체 진행률 ${progressPercentage}%`,
    description:
      progressPercentage >= 100
        ? '모든 마일스톤을 달성했어요.'
        : '남은 마일스톤을 향해 진행 중이에요.',
  };
}
