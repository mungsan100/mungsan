import Link from 'next/link';
import { LuContact, LuPlus } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getMyCardsQuery } from '../queries/my-cards.query';
import { BusinessCardItem } from './business-card-item';

// 명함첩(2026-07-21) — 내 정보 탭 안 독립 섹션. 저장한 명함 목록 + "명함 추가"(촬영/업로드 → AI 인식).
export async function MyCardsSection() {
  const user = await getCurrentUser();
  const cards = await getMyCardsQuery(user.id);

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
          cards.map((card) => <BusinessCardItem key={card.id} card={card} />)
        )}
      </div>
    </section>
  );
}
