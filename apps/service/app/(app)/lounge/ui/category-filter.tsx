'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { loungeCategories } from '../mock';

// 카테고리 필터 칩 — 가로스크롤, 활성 칩은 그린 채움. 인터랙션 leaf라 client.
export const CategoryFilter = () => {
  const [active, setActive] = useState(loungeCategories[0]);

  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {loungeCategories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              isActive
                ? 'border-brand bg-brand text-white'
                : 'border-ink-200 text-ink-600 bg-white',
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
