import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';

import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

import type { MilestoneStep } from '../mock';

const StepIndicator = ({ step }: { step: MilestoneStep }) => {
  if (step.status === 'upcoming') {
    return (
      <span className="border-ink-200 text-ink-400 relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white text-[12px] font-semibold">
        {step.index}
      </span>
    );
  }
  return (
    <span className="bg-brand-deep relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
      <LuCircleCheck className="h-[18px] w-[18px]" />
    </span>
  );
};

const DateLabel = ({
  role,
  value,
  dim,
  tone,
}: {
  role: string;
  value: string;
  dim: boolean;
  tone: 'ours' | 'partner';
}) => {
  return (
    <span className={cn('flex items-center gap-1', dim ? 'text-ink-400' : 'text-ink-600')}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          dim ? 'bg-ink-300' : tone === 'ours' ? 'bg-ink-800' : 'bg-brand',
        )}
      />
      <span className="font-medium">{role}</span> {value}
    </span>
  );
};

// 실시간 마일스톤 — 세로 타임라인(완료/진행중/예정) + 하단 전체 진행률 바.
interface MilestoneTimelineProps {
  steps: MilestoneStep[];
  progress: number;
}

export const MilestoneTimeline = ({ steps, progress }: MilestoneTimelineProps) => {
  return (
    <Card className="p-5">
      <ol className="relative">
        {steps.map((step, i) => (
          <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'absolute top-7 bottom-0 left-[13px] w-px',
                  step.status === 'upcoming' ? 'bg-ink-200' : 'bg-brand-deep',
                )}
              />
            )}
            <StepIndicator step={step} />
            <div className="min-w-0 flex-1 pt-0.5">
              <h3
                className={cn(
                  'text-[15px] font-bold',
                  step.status === 'upcoming' ? 'text-ink-400' : 'text-ink-900',
                )}
              >
                {step.title}
              </h3>
              {step.warning && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[12px] font-medium text-amber-600">
                  <LuTriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  {step.warning}
                </div>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                <DateLabel
                  role="우리"
                  value={step.ours}
                  dim={step.status === 'upcoming'}
                  tone="ours"
                />
                <DateLabel
                  role="파트너"
                  value={step.partner}
                  dim={step.status !== 'done'}
                  tone="partner"
                />
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-ink-100 mt-2 flex items-center justify-between border-t pt-4">
        <span className="text-ink-500 text-[13px] font-medium">전체 진행률</span>
        <span className="text-ink-900 text-[15px] font-bold">{progress}%</span>
      </div>
      <ProgressBar value={progress} tone="success" className="mt-2" />
    </Card>
  );
};
