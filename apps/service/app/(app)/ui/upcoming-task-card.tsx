import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type TaskTone = 'danger' | 'warning' | 'success';

export type UpcomingTask = {
  id: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  tone: TaskTone;
};

// 좌측 색 보더는 긴급도(마감 임박·진행중·그 외), 우측 배지는 상태.
const BAR: Record<TaskTone, string> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  success: 'bg-brand',
};

const BADGE: Record<TaskTone, string> = {
  danger: 'bg-danger text-white',
  warning: 'bg-warning text-white',
  success: 'bg-brand text-white',
};

interface UpcomingTaskCardProps {
  task: UpcomingTask;
}

export const UpcomingTaskCard = ({ task }: UpcomingTaskCardProps) => (
  <Card className="relative flex items-center gap-3 overflow-hidden p-4 pl-5">
    <span className={cn('absolute top-3 bottom-3 left-0 w-1 rounded-r-full', BAR[task.tone])} />
    <div className="min-w-0 flex-1">
      <p className="text-ink-900 truncate text-[15px] font-bold">{task.title}</p>
      <p className="text-ink-400 mt-0.5 text-[13px]">{task.subtitle}</p>
    </div>
    <Badge size="md" className={cn('shrink-0', BADGE[task.tone])}>
      {task.statusLabel}
    </Badge>
  </Card>
);
