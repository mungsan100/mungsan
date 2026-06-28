import { cn } from '@/lib/utils';

// 진행률 바 — value(0~100) + tone(상태색). 트랙은 연한 잉크.
type ProgressTone = 'brand' | 'success' | 'warning' | 'danger';

const TONE: Record<ProgressTone, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

interface ProgressBarProps {
  value: number;
  tone?: ProgressTone;
  className?: string;
}

export function ProgressBar({ value, tone = 'brand', className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('bg-ink-100 h-2 w-full overflow-hidden rounded-full', className)}>
      <div className={cn('h-full rounded-full transition-all', TONE[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
