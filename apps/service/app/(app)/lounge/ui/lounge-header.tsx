import { Suspense } from 'react';
import { LuUsersRound } from 'react-icons/lu';

import { LoungeMemberCount } from './lounge-member-count';

// 라운지 밝은 헤더 — 다크 ScreenHeader 대신 canvas 배경 + ink 텍스트. 회원수는 국소 Suspense로 스트리밍.
export const LoungeHeader = () => (
  <header className="bg-canvas px-5 pt-12 pb-5">
    <div className="flex items-center gap-2">
      <LuUsersRound className="text-ink-900 h-7 w-7" />
      <h1 className="text-ink-900 text-2xl font-bold">라운지</h1>
    </div>
    <Suspense fallback={<span className="bg-ink-100 mt-1.5 block h-4 w-44 animate-pulse rounded" />}>
      <LoungeMemberCount />
    </Suspense>
  </header>
);
