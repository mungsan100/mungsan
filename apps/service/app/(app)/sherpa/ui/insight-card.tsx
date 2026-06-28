import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuChartColumn, LuChevronRight, LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { InsightCard as InsightCardData, InsightIconKey, InsightTone } from '../mock';

const ICONS: Record<InsightIconKey, IconType> = {
  alert: LuTriangleAlert,
  chart: LuChartColumn,
  check: LuCircleCheck,
};

const TONE: Record<InsightTone, { bar: string; iconWrap: string; link: string }> = {
  amber: { bar: 'bg-amber-400', iconWrap: 'bg-amber-50 text-amber-500', link: 'text-amber-600' },
  forest: { bar: 'bg-brand-sub01', iconWrap: 'bg-brand-soft text-brand-sub01', link: 'text-brand' },
  green: { bar: 'bg-brand', iconWrap: 'bg-brand-soft text-brand', link: 'text-brand' },
};

// 셰르파 업무 요약 — 좌측 컬러 강조선 + 아이콘 + 하단 액션 링크의 인사이트 카드.
interface InsightCardProps {
  card: InsightCardData;
}

export const InsightCard = ({ card }: InsightCardProps) => {
  const Icon = ICONS[card.icon];
  const tone = TONE[card.tone];

  return (
    <Card className="relative overflow-hidden p-4 pl-5">
      <span className={cn('absolute top-0 bottom-0 left-0 w-1.5', tone.bar)} />
      <div className="flex gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            tone.iconWrap,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-ink-900 text-[15px] leading-snug font-bold">{card.title}</h3>
          <p className="text-ink-500 mt-1 text-[13px] leading-relaxed">{card.description}</p>
          <Link
            href="#"
            className={cn(
              'mt-3 inline-flex items-center gap-0.5 text-[13px] font-semibold',
              tone.link,
            )}
          >
            {card.linkLabel}
            <LuChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
