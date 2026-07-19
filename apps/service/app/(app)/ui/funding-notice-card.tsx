import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { MatchRing } from './match-ring';

// 홈 지원사업 카드 표시 모델 — 맞춤 추천 단(매칭률 링)·새 공고 단(등록일) 공용.
export type FundingNoticeTag = {
  label: string;
  variant: 'fit' | 'review' | 'dday';
};

export type FundingNotice = {
  organization: string;
  title: string;
  description: string;
  matchRate: number | null; // 0~100 원형 게이지 — null이면(새 공고 단) 링 대신 registeredOn 표시
  registeredOn: string | null; // 등록일 라벨(예: "7.18 등록") — 새 공고 단 전용
  tags: FundingNoticeTag[];
  detailUrl: string | null; // 원문 공고 페이지 — 있으면 카드가 새 탭 링크가 된다
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

export const FundingNoticeCard = ({ notice }: FundingNoticeCardProps) => {
  const card = (
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
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  TAG[tag.variant],
                )}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
        {notice.matchRate != null ? (
          <div className="flex shrink-0 flex-col items-center gap-1">
            <MatchRing value={notice.matchRate} />
            <span className="text-ink-400 text-[11px]">매칭률</span>
          </div>
        ) : (
          notice.registeredOn && (
            <span className="text-ink-400 shrink-0 text-[11px]">{notice.registeredOn}</span>
          )
        )}
      </div>
    </Card>
  );

  // 원문 링크가 있으면(수집 공고) 카드 전체를 새 탭 링크로 — 시드/수동 공고는 그대로 정적 카드.
  if (!notice.detailUrl) return card;
  return (
    <a href={notice.detailUrl} target="_blank" rel="noopener noreferrer" className="block">
      {card}
    </a>
  );
};
