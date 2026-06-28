import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// 다크그린 풀블리드 화면 헤더 — 5개 탭 화면이 공유한다.
// label(소제목)·title(큰 제목)·right(우측 컨트롤)·children(헤더 하단 영역: 통계카드·검색바·배너 등).
interface ScreenHeaderProps {
  label?: string;
  labelIcon?: ReactNode;
  title: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ScreenHeader({
  label,
  labelIcon,
  title,
  right,
  children,
  className,
}: ScreenHeaderProps) {
  return (
    <header
      className={cn(
        'from-header-from to-header-to bg-gradient-to-b px-5 pt-12 pb-6 text-white',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {label && (
            <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-white/75">
              {labelIcon}
              <span>{label}</span>
            </div>
          )}
          <h1 className="text-[26px] leading-tight font-bold">{title}</h1>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {children}
    </header>
  );
}
