import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

export type ProjectProgress = {
  title: string;
  subtitle: string;
  statusLabel: string;
  tone: 'success' | 'danger';
  percent: number;
};

interface ProjectProgressCardProps {
  project: ProjectProgress;
}

// 진행 중 협업 카드 — 제목/퍼센트 한 행, 부제(설명 · 파생 상태), 진행바(상태 톤).
export const ProjectProgressCard = ({ project }: ProjectProgressCardProps) => {
  const toneText = project.tone === 'danger' ? 'text-danger' : 'text-brand';
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-ink-900 truncate text-[15px] font-bold">{project.title}</h3>
        <span className="text-ink-900 shrink-0 text-[15px] font-bold">{project.percent}%</span>
      </div>
      <p className="text-ink-400 mt-1 mb-2.5 text-[13px]">
        {project.subtitle} · <span className={cn('font-semibold', toneText)}>{project.statusLabel}</span>
      </p>
      <ProgressBar value={project.percent} tone={project.tone === 'danger' ? 'danger' : 'brand'} />
    </Card>
  );
};
