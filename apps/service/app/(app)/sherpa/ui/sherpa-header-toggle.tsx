'use client';

import { cn } from '@/lib/utils';

// 마일스톤 목록 필터 세그먼트 컨트롤 — 전체 / 진행중. 부모(MilestoneTimeline)가 상태를 소유하는 controlled 컴포넌트.
export type MilestoneFilter = 'all' | 'active';

const OPTIONS: { value: MilestoneFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행중' },
];

interface SherpaHeaderToggleProps {
  value: MilestoneFilter;
  onChange: (value: MilestoneFilter) => void;
}

export const SherpaHeaderToggle = ({ value, onChange }: SherpaHeaderToggleProps) => {
  return (
    <div className="bg-ink-100 flex items-center gap-1 rounded-full p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors',
            value === opt.value ? 'text-ink-900 bg-white shadow-sm' : 'text-ink-500',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
