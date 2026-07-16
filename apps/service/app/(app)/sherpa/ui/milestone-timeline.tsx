'use client';

import { useState } from 'react';
import { LuCalendar, LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { formatKst } from '@/lib/datetime/format-kst';
import { cn } from '@/lib/utils';

import type { SherpaMilestoneStatus, SherpaMilestoneView } from '../queries/sherpa-milestones.query';
import { SherpaHeaderToggle, type MilestoneFilter } from './sherpa-header-toggle';

const STATUS_META: Record<
  SherpaMilestoneStatus,
  { label: string; variant: 'success' | 'default' | 'secondary' }
> = {
  done: { label: '완료', variant: 'success' },
  active: { label: '진행중', variant: 'default' },
  upcoming: { label: '예정', variant: 'secondary' },
};

// 마일스톤 타임라인 — 세그먼트 필터(전체/진행중) + 세로 타임라인 + 하단 전체 진행률.
interface MilestoneTimelineProps {
  milestones: SherpaMilestoneView[];
  progress: number;
}

export const MilestoneTimeline = ({ milestones, progress }: MilestoneTimelineProps) => {
  const [filter, setFilter] = useState<MilestoneFilter>('all');
  const visible = filter === 'active' ? milestones.filter((m) => m.status === 'active') : milestones;

  return (
    <div className="space-y-3">
      <SherpaHeaderToggle value={filter} onChange={setFilter} />

      <Card className="p-5">
        {milestones.length === 0 ? (
          <p className="text-ink-500 py-6 text-center text-sm">등록된 마일스톤이 없습니다.</p>
        ) : visible.length === 0 ? (
          <p className="text-ink-500 py-6 text-center text-sm">진행중인 마일스톤이 없습니다.</p>
        ) : (
          <ol className="relative">
            {visible.map((m, i) => (
              <li key={m.id} className="relative flex gap-3 pb-6 last:pb-0">
                {i < visible.length - 1 && (
                  <span
                    className={cn(
                      'absolute top-7 bottom-0 left-[13px] w-px',
                      m.status === 'upcoming' ? 'bg-ink-200' : 'bg-brand-deep',
                    )}
                  />
                )}
                <StepIndicator status={m.status} index={i + 1} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={cn(
                        'text-[15px] font-bold',
                        m.status === 'upcoming' ? 'text-ink-400' : 'text-ink-900',
                      )}
                    >
                      {m.title}
                    </h3>
                    <Badge variant={STATUS_META[m.status].variant} size="sm">
                      {STATUS_META[m.status].label}
                    </Badge>
                  </div>

                  <div className="text-ink-500 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                    <span className="flex items-center gap-1">
                      <LuCalendar className="text-ink-400 h-3.5 w-3.5 shrink-0" />
                      {formatPeriod(m.startDate, m.endDate)}
                    </span>
                    {m.totalTasks > 0 && (
                      <span>
                        할 일 {m.doneTasks}/{m.totalTasks}
                      </span>
                    )}
                  </div>

                  {m.overdueTasks > 0 && (
                    <Badge variant="warning" size="sm" className="mt-1.5">
                      <LuTriangleAlert className="h-3 w-3 shrink-0" />
                      지연 {m.overdueTasks}건
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="border-ink-100 mt-2 flex items-center justify-between border-t pt-4">
          <span className="text-ink-500 text-[13px] font-medium">전체 진행률</span>
          <span className="text-ink-900 text-[15px] font-bold">{progress}%</span>
        </div>
        <ProgressBar value={progress} tone="success" className="mt-2" />
      </Card>
    </div>
  );
};

const StepIndicator = ({ status, index }: { status: SherpaMilestoneStatus; index: number }) => {
  if (status === 'done') {
    return (
      <span className="bg-brand-deep relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
        <LuCircleCheck className="h-[18px] w-[18px]" />
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="bg-brand relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white">
        {index}
      </span>
    );
  }
  return (
    <span className="border-ink-200 text-ink-400 relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white text-[12px] font-semibold">
      {index}
    </span>
  );
};

function formatPeriod(start: Date | null, end: Date | null): string {
  if (start && end) return `${formatKst(start, 'M/d')} ~ ${formatKst(end, 'M/d')}`;
  if (end) return `~ ${formatKst(end, 'M/d')}`;
  if (start) return `${formatKst(start, 'M/d')} ~`;
  return '일정 미정';
}
