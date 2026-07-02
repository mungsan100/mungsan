import { LuCalendar, LuLayers, LuWallet } from 'react-icons/lu';

import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { formatKst } from '@/lib/datetime/format-kst';

import { getSherpaProjectQuery } from '../queries/sherpa-project.query';

// primary 프로젝트 요약 카드 — 제목/진행률/기간/예산. 프로젝트가 없으면 빈 상태 카드.
export const ProjectBanner = async () => {
  const project = await getSherpaProjectQuery();

  if (!project) {
    return (
      <Card className="flex flex-col items-center gap-2 p-8 text-center">
        <span className="bg-ink-100 text-ink-400 flex h-12 w-12 items-center justify-center rounded-2xl">
          <LuLayers className="h-6 w-6" />
        </span>
        <p className="text-ink-500 text-sm">아직 진행 중인 프로젝트가 없습니다.</p>
      </Card>
    );
  }

  const period = formatPeriod(project.startDate, project.endDate);
  const budget = project.budgetInCheonwon != null ? formatBudget(project.budgetInCheonwon) : null;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="bg-brand-soft text-brand flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
          <LuLayers className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-ink-900 text-lg leading-snug font-bold">{project.title}</h2>
          {project.description && (
            <p className="text-ink-500 mt-0.5 line-clamp-1 text-sm">{project.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-ink-500 text-[13px] font-medium">진행률</span>
          <span className="text-ink-900 text-sm font-bold">{project.progressPercentage}%</span>
        </div>
        <ProgressBar value={project.progressPercentage} tone="success" className="mt-2" />
      </div>

      <div className="border-ink-100 mt-4 flex items-center gap-5 border-t pt-4 text-[13px]">
        <span className="flex items-center gap-1.5">
          <LuCalendar className="text-ink-400 h-4 w-4 shrink-0" />
          <span className="text-ink-700 font-medium">{period}</span>
        </span>
        {budget && (
          <span className="flex items-center gap-1.5">
            <LuWallet className="text-ink-400 h-4 w-4 shrink-0" />
            <span className="text-ink-700 font-medium">{budget}</span>
          </span>
        )}
      </div>
    </Card>
  );
};

function formatPeriod(start: Date | null, end: Date | null): string {
  if (start && end) return `${formatKst(start, 'M/d')} ~ ${formatKst(end, 'M/d')}`;
  if (end) return `~ ${formatKst(end, 'M/d')}`;
  if (start) return `${formatKst(start, 'M/d')} ~`;
  return '기간 미정';
}

// budgetInCheonwon(천 원 단위) → 억/만원 표기. 만원 = 천원 / 10.
function formatBudget(cheonwon: number): string {
  const manwon = Math.round(cheonwon / 10);
  if (manwon >= 10000) {
    const eok = Math.floor(manwon / 10000);
    const rest = manwon % 10000;
    return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${manwon.toLocaleString()}만원`;
}
