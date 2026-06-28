import {
  LuChevronRight,
  LuCircleCheck,
  LuFileText,
  LuTrendingUp,
} from 'react-icons/lu';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { DecisionAlert, DecisionIcon, DecisionTone } from './mock';

// 의사결정 알림 리스트 카드 — 좌측 아이콘 박스 + 제목/부제 + chevron. 긴급은 좌측 빨강 강조선.
interface DecisionAlertCardProps {
  alert: DecisionAlert;
}

const ICONS: Record<DecisionIcon, React.ComponentType<{ className?: string }>> = {
  file: LuFileText,
  trend: LuTrendingUp,
  check: LuCircleCheck,
};

const TONE: Record<DecisionTone, string> = {
  danger: 'bg-red-50 text-red-500',
  warning: 'bg-amber-50 text-amber-500',
  success: 'bg-emerald-50 text-emerald-600',
};

export const DecisionAlertCard = ({ alert }: DecisionAlertCardProps) => {
  const Icon = ICONS[alert.icon];
  return (
    <Card className="relative flex items-center gap-3 overflow-hidden p-4">
      {alert.urgent && <span className="absolute top-0 bottom-0 left-0 w-1 bg-red-500" />}
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          TONE[alert.tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink-900 text-[14px] font-semibold">{alert.title}</p>
        <p className="text-ink-400 mt-0.5 text-[12px]">{alert.subtitle}</p>
      </div>
      <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />
    </Card>
  );
};
