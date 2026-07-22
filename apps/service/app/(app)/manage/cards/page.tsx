import { Suspense } from 'react';
import Link from 'next/link';
import { LuContact, LuPlus, LuSearch } from 'react-icons/lu';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getMyCardsQuery } from '../queries/my-cards.query';
import { BusinessCardItem } from '../ui/business-card-item';
import { SubpageBack, SubpageSkeleton } from '../ui/subpage-back';

// 명함첩 전용 페이지(2026-07-22) — 내 정보 허브의 무한 나열을 대체한다.
// 검색은 GET 폼(?q=)으로 서버 필터 — 이름·회사·직책·연락처·이메일 부분 일치.
// 목록·추가·삭제는 기존 컴포넌트/액션 그대로 재사용(BusinessCardItem, delete-business-card).
export default function CardsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <>
      <SubpageBack />
      <main className="space-y-4 px-5 pt-2 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuContact className="text-ink-500 h-5 w-5" />
            <h1 className="text-ink-900 text-xl font-bold">명함첩</h1>
          </div>
          <Link
            href="/manage/cards/new"
            className="bg-ink-900 inline-flex h-9 items-center justify-center gap-1 rounded-full px-3.5 text-[13px] font-semibold text-white"
          >
            <LuPlus className="h-4 w-4" /> 명함 추가
          </Link>
        </div>

        <Suspense fallback={<SubpageSkeleton />}>
          <CardList searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function CardList({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const user = await getCurrentUser();
  const cards = await getMyCardsQuery(user.id, { q: query || undefined });

  return (
    <div className="space-y-3">
      {/* GET 폼 — 제출하면 ?q= 로 서버 필터. JS 없이도 동작하고 뒤로가기·공유에도 안전하다. */}
      <form method="GET" action="/manage/cards" className="border-ink-200 flex h-11 items-center gap-2.5 rounded-xl border bg-white px-4">
        <LuSearch className="text-ink-400 h-[18px] w-[18px] shrink-0" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="이름·회사·직책·연락처 검색"
          className="text-ink-900 placeholder:text-ink-400 h-full w-full bg-transparent text-[15px] outline-none"
        />
      </form>

      {cards.length === 0 ? (
        query ? (
          <p className="text-ink-400 py-16 text-center text-sm">
            &lsquo;{query}&rsquo; 검색 결과가 없습니다.
          </p>
        ) : (
          <Link
            href="/manage/cards/new"
            className="border-ink-200 text-ink-500 flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed"
          >
            <LuPlus className="h-6 w-6" />
            <span className="text-sm font-semibold">명함을 촬영해 저장해 보세요</span>
          </Link>
        )
      ) : (
        <>
          <p className="text-ink-400 text-[13px]">
            {query ? `검색 결과 ${cards.length}장` : `전체 ${cards.length}장`}
          </p>
          <div className="space-y-2">
            {cards.map((card) => (
              <BusinessCardItem key={card.id} card={card} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
