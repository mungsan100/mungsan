import Link from 'next/link';
import { LuChevronRight, LuContact, LuPlus } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { countMyCardsQuery, getMyCardsQuery } from '../queries/my-cards.query';
import { BusinessCardItem } from './business-card-item';

// 최근 몇 장만 미리 보여주고 나머지는 전용 페이지로 — 허브가 명함 수에 비례해 길어지지 않게.
const PREVIEW_COUNT = 3;

// 명함첩(2026-07-21) — 내 정보 탭 안 독립 섹션. 2026-07-22: 전체 나열 대신 최근 3장 미리보기 +
// "전체 N장 보기" 링크(전용 페이지 /manage/cards — 검색 포함)로 축소.
export async function MyCardsSection() {
  const user = await getCurrentUser();
  const [cards, total] = await Promise.all([
    getMyCardsQuery(user.id, { take: PREVIEW_COUNT }),
    countMyCardsQuery(user.id),
  ]);

  return (
    <section className="px-5">
      <SectionHeader
        icon={<LuContact className="h-[18px] w-[18px]" />}
        title="명함첩"
        action={{ label: '명함 추가', href: '/manage/cards/new' }}
      />
      <div className="mt-3 space-y-2">
        {cards.length === 0 ? (
          <Link
            href="/manage/cards/new"
            className="border-ink-200 text-ink-500 flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed"
          >
            <LuPlus className="h-6 w-6" />
            <span className="text-sm font-semibold">명함을 촬영해 저장해 보세요</span>
          </Link>
        ) : (
          <>
            {cards.map((card) => (
              <BusinessCardItem key={card.id} card={card} />
            ))}
            <Link
              href="/manage/cards"
              className="border-ink-200 text-ink-700 flex h-11 w-full items-center justify-center gap-1 rounded-xl border bg-white text-sm font-semibold"
            >
              전체 {total}장 보기 <LuChevronRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
