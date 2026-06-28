import { LuTrendingUp } from 'react-icons/lu';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import { trendItems } from '../mock';

// 실시간 트렌드 — 번호 리스트 + 우측 상태 배지.
export const TrendCard = () => {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <LuTrendingUp className="text-brand h-[18px] w-[18px]" />
        <h2 className="text-ink-900 text-[17px] font-bold">실시간 트렌드</h2>
      </div>
      <ul className="mt-4 space-y-3.5">
        {trendItems.map((item) => (
          <li key={item.rank} className="flex items-center gap-3">
            <span className="text-brand w-3 shrink-0 text-[15px] font-bold">{item.rank}</span>
            <span className="text-ink-700 flex-1 text-[15px] font-medium">{item.title}</span>
            <Badge variant={item.badgeTone} size="sm" className="font-bold">
              {item.badgeLabel}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
};
