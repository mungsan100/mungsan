'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LuSearch, LuSlidersHorizontal } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// 검색바 — 제출 시 ?q=로 URL state 갱신(현재 ?industry=는 보존). 우측 그린 버튼이 검색 적용 트리거.
// 상세 필터 패널(역량·지역)은 후속 — 지금은 산업축 탭 + 텍스트 검색으로 충분.
export const CollabSearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const [isPending, startTransition] = useTransition();

  // 이 client 폼은 URL이 바뀌어도 remount되지 않는다(경계에 key 없음) → back/forward·외부
  // 네비로 ?q=가 바뀌면 입력값이 stale해진다. 렌더 단계 동기화로 URL과 입력값을 맞춘다.
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    const industry = searchParams.get('industry');
    if (industry) sp.set('industry', industry);
    const trimmed = q.trim();
    if (trimmed) sp.set('q', trimmed);
    startTransition(() => router.push(sp.size ? `/collab?${sp}` : '/collab'));
  }

  return (
    <form onSubmit={submit} className={cn('mt-4 flex items-center gap-2', isPending && 'opacity-60')}>
      <div className="border-ink-200 flex h-12 flex-1 items-center gap-2.5 rounded-xl border bg-white px-4">
        <LuSearch className="text-ink-400 h-[18px] w-[18px] shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="기업명, 업종, 기술 검색"
          className="text-ink-900 placeholder:text-ink-400 h-full w-full bg-transparent text-[15px] outline-none"
        />
      </div>
      <button
        type="submit"
        aria-label="검색"
        className="border-ink-200 text-ink-700 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white"
      >
        <LuSlidersHorizontal className="h-5 w-5" />
      </button>
    </form>
  );
};
