'use client';

import { useState, useTransition } from 'react';
import { LuPencil } from 'react-icons/lu';
import { toast } from 'sonner';
import type { DB } from '@mungsan/db';

import { cn } from '@/lib/utils';

import { updateLoungeCategoryAction } from '../../commands/update-lounge-category.action';
import { LOUNGE_CATEGORY_LABELS } from '../../ui/lounge-category';

const CATEGORY_VALUES = Object.keys(LOUNGE_CATEGORY_LABELS) as DB.LoungeCategory[];

// 카테고리 표시 + 작성자 본인만 보이는 수정 버튼(2026-07-20, 5-3). AI 자동 분류 결과를 바로잡는다.
export const CategoryEditor = ({
  postId,
  category,
  editable,
}: {
  postId: string;
  category: DB.LoungeCategory;
  editable: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function choose(next: DB.LoungeCategory) {
    if (next === category) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await updateLoungeCategoryAction({ postId, category: next });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      setEditing(false);
    });
  }

  if (!editable)
    return (
      <span className="bg-brand-soft text-brand-sub02 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold">
        {LOUNGE_CATEGORY_LABELS[category]}
      </span>
    );

  if (!editing)
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="bg-brand-soft text-brand-sub02 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      >
        {LOUNGE_CATEGORY_LABELS[category]}
        <LuPencil className="h-3 w-3" />
      </button>
    );

  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          disabled={isPending}
          onClick={() => choose(value)}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50',
            value === category
              ? 'border-brand bg-brand text-white'
              : 'border-ink-200 text-ink-600 bg-white',
          )}
        >
          {LOUNGE_CATEGORY_LABELS[value]}
        </button>
      ))}
    </div>
  );
};
