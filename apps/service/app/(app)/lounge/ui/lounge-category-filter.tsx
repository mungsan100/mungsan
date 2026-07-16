'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { DB } from '@mungsan/db';

import { cn } from '@/lib/utils';

import { LOUNGE_CATEGORY_LABELS } from './lounge-category';

const CATEGORY_VALUES = Object.keys(LOUNGE_CATEGORY_LABELS) as DB.LoungeCategory[];

// 게시글 카테고리(LoungeCategory) 필터 — 업종 필터(CategoryFilter)와 별개 축이라 함께 걸 수 있다.
export const LoungeCategoryFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const raw = searchParams.get('category');
  const active = (CATEGORY_VALUES as string[]).includes(raw ?? '')
    ? (raw as DB.LoungeCategory)
    : null;

  function select(category: DB.LoungeCategory | null) {
    const sp = new URLSearchParams(searchParams);
    if (category) sp.set('category', category);
    else sp.delete('category');
    startTransition(() => router.push(sp.size ? `${pathname}?${sp}` : pathname));
  }

  return (
    <div
      className={cn('no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5', isPending && 'opacity-60')}
    >
      <Chip label="전체" isActive={active === null} onClick={() => select(null)} />
      {CATEGORY_VALUES.map((category) => (
        <Chip
          key={category}
          label={LOUNGE_CATEGORY_LABELS[category]}
          isActive={active === category}
          onClick={() => select(category)}
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
