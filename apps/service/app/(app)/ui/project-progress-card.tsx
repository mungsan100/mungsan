import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

import type { ProjectProgress, ProjectStatus } from './mock';

// 진행 현황 카드 — 제목/단계 + 상태 점·라벨 + 진행 설명/% + 진행바(상태 톤).
interface ProjectProgressCardProps {
  project: ProjectProgress;
}

type StatusStyle = {
  dot: string;
  text: string;
  tone: 'success' | 'warning' | 'danger';
};

const STATUS: Record<ProjectStatus, StatusStyle> = {
  delayed: { dot: 'bg-amber-500', text: 'text-amber-500', tone: 'warning' },
  normal: { dot: 'bg-emerald-500', text: 'text-emerald-600', tone: 'success' },
  urgent: { dot: 'bg-red-500', text: 'text-red-500', tone: 'danger' },
};

export const ProjectProgressCard = ({ project }: ProjectProgressCardProps) => {
  const style = STATUS[project.status];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-ink-900 text-[16px] font-bold">{project.title}</h3>
          <p className="text-ink-400 mt-0.5 text-[13px]">{project.stage}</p>
        </div>
        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 text-[13px] font-semibold',
            style.text,
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', style.dot)} />
          {project.statusLabel}
        </span>
      </div>
      <div className="mt-3 mb-2 flex items-center justify-between">
        <span className="text-ink-500 text-[13px]">{project.description}</span>
        <span className="text-ink-900 text-[14px] font-bold">{project.percent}%</span>
      </div>
      <ProgressBar value={project.percent} tone={style.tone} />
    </Card>
  );
};
