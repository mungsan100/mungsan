'use client';

import { useState } from 'react';
import { LuGlobe, LuLock } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// 내부용 ↔ 외부공유 세그먼트 토글 — 이 화면의 유일한 인터랙티브 leaf.
type ShareMode = 'internal' | 'external';

export const SherpaHeaderToggle = () => {
  const [mode, setMode] = useState<ShareMode>('internal');

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
      <button
        type="button"
        onClick={() => setMode('internal')}
        className={cn(
          'flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
          mode === 'internal' ? 'text-brand-sub02 bg-white' : 'text-white/70',
        )}
      >
        <LuLock className="h-3.5 w-3.5" />
        내부용
      </button>
      <button
        type="button"
        onClick={() => setMode('external')}
        className={cn(
          'flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
          mode === 'external' ? 'text-brand-sub02 bg-white' : 'text-white/70',
        )}
      >
        <LuGlobe className="h-3.5 w-3.5" />
        외부공유
      </button>
    </div>
  );
};
