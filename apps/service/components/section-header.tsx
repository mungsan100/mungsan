import type { ReactNode } from 'react';
import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// 섹션 헤더 — 좌측 아이콘+제목, 우측 "전체보기 >" 류 액션 링크.
interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  action?: { label: string; href?: string };
  className?: string;
}

export function SectionHeader({ icon, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-ink-500">{icon}</span>}
        <h2 className="text-ink-900 text-[17px] font-bold">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href ?? '#'}
          className="text-ink-400 flex items-center gap-0.5 text-[13px]"
        >
          {action.label}
          <LuChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
