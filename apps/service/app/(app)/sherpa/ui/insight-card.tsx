import type { IconType } from 'react-icons';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type InsightTone = 'brand' | 'success' | 'warning';

const TONE: Record<InsightTone, { bar: string; iconWrap: string }> = {
  brand: { bar: 'bg-brand', iconWrap: 'bg-brand-soft text-brand' },
  success: { bar: 'bg-success', iconWrap: 'bg-emerald-50 text-emerald-600' },
  warning: { bar: 'bg-warning', iconWrap: 'bg-amber-50 text-amber-600' },
};

// 셰르파 업무 요약 — 좌측 컬러 강조선 + 아이콘 + 제목/설명의 인사이트 카드.
interface InsightCardProps {
  tone: InsightTone;
  icon: IconType;
  title: string;
  description: string;
}

export const InsightCard = ({ tone, icon: Icon, title, description }: InsightCardProps) => {
  const t = TONE[tone];

  return (
    <Card className="relative overflow-hidden p-4 pl-5">
      <span className={cn('absolute top-0 bottom-0 left-0 w-1.5', t.bar)} />
      <div className="flex gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            t.iconWrap,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-ink-900 text-[15px] leading-snug font-bold">{title}</h3>
          <p className="text-ink-500 mt-1 text-[13px] leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
};
