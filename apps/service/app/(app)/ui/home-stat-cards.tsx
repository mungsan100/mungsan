import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';

import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getTrustScoreQuery } from '@/lib/trust/trust-score.query';

import { getHomeStatsQuery } from '../queries/home-stats.query';

type StatCard = { value: number; unit: string; label: string; href: string };

// 3-스탯 카드 — 진행 협업·매칭 대기·신뢰 지수 실수치. 각 카드는 해당 화면으로 링크.
export async function HomeStatCards() {
  const user = await getCurrentUser();
  const [{ activeCollaborations, pendingMatches }, trust] = await Promise.all([
    getHomeStatsQuery(user.id),
    getTrustScoreQuery(user.id),
  ]);

  const cards: StatCard[] = [
    { value: activeCollaborations, unit: '건', label: '진행 중 협업', href: '/sherpa' },
    { value: pendingMatches, unit: '건', label: '매칭 대기', href: '/collab' },
    { value: trust.score, unit: '점', label: '신뢰 지수', href: '/manage' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cards.map((c) => (
        <Link key={c.label} href={c.href} className="block">
          <Card className="p-3.5">
            <div className="flex items-start justify-between">
              <p className="text-ink-900">
                <span className="text-[22px] font-bold">{c.value}</span>
                <span className="ml-0.5 text-[13px] font-semibold">{c.unit}</span>
              </p>
              <LuChevronRight className="text-ink-300 h-4 w-4 shrink-0" />
            </div>
            <p className="text-ink-500 mt-1.5 text-[12px]">{c.label}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
