'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { cn } from '@/lib/utils';

import type { IndustryOption } from '../queries/collab-industries.query';

// 산업축 카테고리 탭 — 가로스크롤, 활성 칩은 그린 채움. 활성 값은 URL(?industry=)에서 읽고,
// 선택 시 URL을 갱신해 서버 피드가 다시 조회되게 한다. 현재 ?q= 검색어는 보존한다.
interface CollabCategoryFilterProps {
  industries: IndustryOption[];
}

export const CollabCategoryFilter = ({ industries }: CollabCategoryFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const active = searchParams.get('industry');

  function select(industryId: string | null) {
    const sp = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) sp.set('q', q);
    if (industryId) sp.set('industry', industryId);
    startTransition(() => router.push(sp.size ? `/collab?${sp}` : '/collab'));
  }

  return (
    <div
      className={cn(
        'no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5',
        isPending && 'opacity-60',
      )}
    >
      <Chip label="전체" isActive={!active} onClick={() => select(null)} />
      {industries.map((ind) => (
        <Chip
          key={ind.id}
          label={ind.name}
          isActive={active === ind.id}
          onClick={() => select(ind.id)}
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
