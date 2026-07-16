import Link from 'next/link';
import { LuTrendingUp } from 'react-icons/lu';

import { Card } from '@/components/ui/card';

import { getLoungeTrendsQuery } from '../queries/lounge-trends.query';

// 실시간 트렌드 — 최근 창에서 답글 많은 글 상위 3. 번호 + 제목 + "답글 {n}"(상승 아이콘).
export async function TrendCard() {
  const trends = await getLoungeTrendsQuery();
  if (trends.length === 0) return null;

  return (
    <Card className="p-5">
      <h2 className="text-ink-900 text-[17px] font-bold">실시간 트렌드</h2>
      <ul className="mt-4 space-y-3.5">
        {trends.map((trend, i) => (
          <li key={trend.id}>
            <Link href={`/lounge/${trend.id}`} className="flex items-center gap-3">
              <span className="text-brand w-3 shrink-0 text-[15px] font-bold">{i + 1}</span>
              <span className="text-ink-700 line-clamp-1 flex-1 text-[15px] font-medium">
                {trend.title}
              </span>
              <span className="text-brand flex shrink-0 items-center gap-1 text-[13px] font-semibold">
                <LuTrendingUp className="h-3.5 w-3.5" />
                답글 {trend.commentCount}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
