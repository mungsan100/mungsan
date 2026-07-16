import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  LuChevronRight,
  LuCircleCheck,
  LuFileText,
  LuTrendingUp,
} from 'react-icons/lu';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type DecisionIcon = 'file' | 'trend' | 'check';
export type DecisionTone = 'warning' | 'success';

export type DecisionAlert = {
  icon: DecisionIcon;
  tone: DecisionTone;
  title: string;
  subtitle: string;
  href?: string;
  unread?: boolean; // 아직 읽지 않은 알림이면 제목 옆에 표식
};

const ICONS: Record<DecisionIcon, React.ComponentType<{ className?: string }>> = {
  file: LuFileText,
  trend: LuTrendingUp,
  check: LuCircleCheck,
};

const TONE: Record<DecisionTone, string> = {
  warning: 'bg-amber-50 text-amber-500',
  success: 'bg-emerald-50 text-emerald-600',
};

interface DecisionAlertCardProps {
  alert: DecisionAlert;
}

// 의사결정 알림 카드 — 타입 아이콘(톤) + 제목/부제. linkUrl 있으면 카드 전체가 Link(우측 chevron).
export const DecisionAlertCard = ({ alert }: DecisionAlertCardProps) => {
  const Icon = ICONS[alert.icon];
  const inner: ReactNode = (
    <>
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          TONE[alert.tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink-900 flex items-center gap-1.5 text-[14px] font-semibold">
          <span className="truncate">{alert.title}</span>
          {alert.unread && (
            <span
              className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full"
              aria-label="읽지 않음"
            />
          )}
        </p>
        <p className="text-ink-400 mt-0.5 text-[12px]">{alert.subtitle}</p>
      </div>
      {alert.href && <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />}
    </>
  );

  return (
    <Card className="p-0">
      {alert.href ? (
        <Link href={alert.href} className="flex items-center gap-3 p-4">
          {inner}
        </Link>
      ) : (
        <div className="flex items-center gap-3 p-4">{inner}</div>
      )}
    </Card>
  );
};
