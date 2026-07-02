import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { MatchRing } from './match-ring';

// AI 맞춤 사업 공고 카드 표시 모델.
export type FundingNoticeTag = {
  label: string;
  variant: 'fit' | 'review' | 'dday';
};

export type FundingNotice = {
  organization: string;
  title: string;
  description: string;
  matchRate: number; // 0~100, 원형 게이지 표시값
  tags: FundingNoticeTag[];
};

// 태그 종류 → 스타일. 적합(연녹 채움)·검토(녹색 외곽선)·D-day(진녹 채움).
const TAG: Record<FundingNoticeTag['variant'], string> = {
  fit: 'bg-brand-soft text-brand-sub02',
  review: 'border border-brand-sub01/30 text-brand-sub01',
  dday: 'bg-brand-sub02 text-white',
};

interface FundingNoticeCardProps {
  notice: FundingNotice;
}

export const FundingNoticeCard = ({ notice }: FundingNoticeCardProps) => (
  <Card className="p-4">
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-ink-400 text-[11px] font-semibold">{notice.organization}</p>
        <h3 className="text-ink-900 mt-0.5 text-[15px] leading-snug font-bold">{notice.title}</h3>
        <p className="text-ink-400 mt-1 line-clamp-2 text-[13px] leading-relaxed">
          {notice.description}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {notice.tags.map((tag) => (
            <span
              key={tag.label}
              className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', TAG[tag.variant])}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <MatchRing value={notice.matchRate} />
        <span className="text-ink-400 text-[11px]">매칭률</span>
      </div>
    </div>
  </Card>
);
