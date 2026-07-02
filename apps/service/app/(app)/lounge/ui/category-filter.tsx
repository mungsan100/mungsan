'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { cn } from '@/lib/utils';

// 산업축 카테고리 탭 — 가로스크롤, 활성 칩은 그린 채움. 활성 값은 URL(?industry=)에서 읽고,
// 선택 시 URL을 갱신해 서버 피드가 다시 조회되게 한다.
interface CategoryFilterProps {
  industries: string[];
}

export const CategoryFilter = ({ industries }: CategoryFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const raw = searchParams.get('industry');
  const active = raw && industries.includes(raw) ? raw : null;

  function select(industry: string | null) {
    const sp = new URLSearchParams();
    if (industry) sp.set('industry', industry);
    startTransition(() => router.push(sp.size ? `${pathname}?${sp}` : pathname));
  }

  return (
    <div
      className={cn('no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5', isPending && 'opacity-60')}
    >
      <Chip label="전체" isActive={active === null} onClick={() => select(null)} />
      {industries.map((industry) => (
        <Chip
          key={industry}
          label={industry}
          isActive={active === industry}
          onClick={() => select(industry)}
        />
      ))}
    </div>
  );
};

const Chip = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
      isActive ? 'border-brand bg-brand text-white' : 'border-ink-200 text-ink-600 bg-white',
    )}
  >
    {label}
  </button>
);
