import Link from 'next/link';

import { cn } from '@/lib/utils';

// 업종 칩 필터 — Link 기반(?industry=업종명). "전체"로 해제. 가로 스크롤 한 줄.
export const SupportIndustryFilter = ({
  industryNames,
  selected,
}: {
  industryNames: string[];
  selected: string | null;
}) => (
  <div className="scrollbar-none -mx-5 flex gap-1.5 overflow-x-auto px-5">
    <Chip href="/support" active={selected == null}>
      전체
    </Chip>
    {industryNames.map((name) => (
      <Chip
        key={name}
        href={`/support?industry=${encodeURIComponent(name)}`}
        active={selected === name}
      >
        {name}
      </Chip>
    ))}
  </div>
);

const Chip = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className={cn(
      'shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors',
      active ? 'border-brand bg-brand text-white' : 'border-ink-200 text-ink-600 bg-white',
    )}
  >
    {children}
  </Link>
);
