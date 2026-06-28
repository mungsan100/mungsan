import { LuSparkles } from 'react-icons/lu';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import type { FundingNotice } from './mock';

// AI 맞춤 사업 공고 카드 — 좌측 그린 강조선 + 기관명/D-day + 제목 + 금액/매칭률.
interface FundingNoticeCardProps {
  notice: FundingNotice;
}

export const FundingNoticeCard = ({ notice }: FundingNoticeCardProps) => {
  return (
    <Card className="relative overflow-hidden p-4 pl-5">
      <span className="bg-brand absolute top-4 bottom-4 left-0 w-1 rounded-r-full" />
      <div className="flex items-start justify-between gap-2">
        <span className="text-brand text-[12px] font-semibold">{notice.agency}</span>
        <Badge variant="danger" size="sm" className="bg-red-500 text-white">
          {notice.dday}
        </Badge>
      </div>
      <h3 className="text-ink-900 mt-1.5 text-[16px] font-bold">{notice.title}</h3>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-brand text-[14px] font-bold">{notice.amount}</span>
        <Badge variant="success" size="sm" className="text-[13px]">
          <LuSparkles className="h-3.5 w-3.5" />
          매칭률 {notice.matchRate}
        </Badge>
      </div>
    </Card>
  );
};
