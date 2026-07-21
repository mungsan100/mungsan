'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LuSearch, LuSlidersHorizontal } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// 검색바 — 제출 시 ?q=만 갱신하고 나머지 필터(업종·역량·지역·예산·기간·정렬 등)는 전부 보존한다.
// 쿼리는 q를 제목·내용·기업명에 AND로 걸어 다른 필터와 교집합으로 좁힌다(2026-07-21 필터 보존 수정).
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
    // 현재 URL의 모든 필터를 그대로 이어받고 q만 교체한다(빈 검색어면 q 제거).
    const sp = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) sp.set('q', trimmed);
    else sp.delete('q');
    startTransition(() => router.push(sp.size ? `/collab?${sp}` : '/collab'));
  }

  return (
    <form onSubmit={submit} className={cn('mt-4 flex items-center gap-2', isPending && 'opacity-60')}>
      <div className="border-ink-200 flex h-12 flex-1 items-center gap-2.5 rounded-xl border bg-white px-4">
        <LuSearch className="text-ink-400 h-[18px] w-[18px] shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목·내용·기업명 검색"
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
