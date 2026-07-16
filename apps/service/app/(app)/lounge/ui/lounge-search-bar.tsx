'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LuSearch } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// 검색바 — 제출 시 ?q=로 URL state 갱신(현재 ?industry=·?category=는 보존).
export const LoungeSearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const [isPending, startTransition] = useTransition();

  // ?q= 이 back/forward·외부 네비로 바뀌면 입력값이 stale해진다 — 렌더 단계 동기화로 맞춘다.
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams(searchParams);
    const trimmed = q.trim();
    if (trimmed) sp.set('q', trimmed);
    else sp.delete('q');
    startTransition(() => router.push(sp.size ? `/lounge?${sp}` : '/lounge'));
  }

  return (
    <form onSubmit={submit} className={cn(isPending && 'opacity-60')}>
      <div className="border-ink-200 flex h-12 items-center gap-2.5 rounded-xl border bg-white px-4">
        <LuSearch className="text-ink-400 h-[18px] w-[18px] shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목, 내용 검색"
          className="text-ink-900 placeholder:text-ink-400 h-full w-full bg-transparent text-[15px] outline-none"
        />
      </div>
    </form>
  );
};
