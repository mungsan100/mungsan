import { differenceInCalendarYears } from 'date-fns';
import Link from 'next/link';
import { LuBadgeCheck, LuChevronRight, LuTrendingUp, LuZap } from 'react-icons/lu';

import { Avatar } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { daysUntilDeadline, isDeadlinePassed } from '@/lib/collab/deadline';
import { cn } from '@/lib/utils';

import type { PartnerCard as PartnerCardData } from '../queries/collab-marketplace.query';
import { RecommendLabel } from './recommend-label';

// 파트너 기업 카드 — featured(강조: 두 문단 설명·필요 파트너사·적합도 게이지·제안 CTA) vs 컴팩트(축약: 상세보기).
interface PartnerCardProps {
  partner: PartnerCardData;
  featured?: boolean;
}

export const PartnerCard = ({ partner, featured = false }: PartnerCardProps) => {
  const detailHref = `/collab/${partner.postId}`;
  const paragraphs = featured
    ? [partner.companyDescription, partner.postDescription].filter((x): x is string => !!x)
    : [partner.companyDescription ?? partner.postDescription].filter((x): x is string => !!x);
  const duration = formatDuration(partner.startDate, partner.endDate);
  // 실 회사 지표 — 지역·업력·인원 중 공개된 것만 " · "로 잇는다.
  const stats = [
    partner.region,
    formatYearsInBusiness(partner.foundedDate),
    partner.headcount != null ? `${partner.headcount}명` : null,
  ].filter((x): x is string => !!x);

  return (
    <Card className={cn('p-5', featured && 'border-brand border-2')}>
      {featured && (
        <div className="mb-3">
          <RecommendLabel />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar fallback={[...partner.companyName][0] ?? '?'} />
          <div className="flex min-w-0 items-center gap-1">
            <h3 className="text-ink-900 truncate text-[17px] font-bold">{partner.companyName}</h3>
            {partner.verified && <LuBadgeCheck className="text-brand h-4 w-4 shrink-0" />}
          </div>
        </div>
        {!featured && partner.matchRate != null && (
          <div className="flex shrink-0 items-baseline gap-1.5">
            <span className="text-ink-400 text-[11px]">적합도</span>
            <span className="text-brand text-[15px] font-bold">{partner.matchRate}%</span>
          </div>
        )}
      </div>

      <div className="text-ink-400 mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
        {isDeadlinePassed(partner.applicationDeadline) ? (
          <span className="bg-ink-200 text-ink-500 rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
            마감
          </span>
        ) : (
          deadlineDday(partner.applicationDeadline) && (
            <span className="bg-danger/10 text-danger rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
              {deadlineDday(partner.applicationDeadline)}
            </span>
          )
        )}
        {partner.industryName && (
          <span className="bg-ink-100 text-ink-600 rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
            {partner.industryName}
          </span>
        )}
        {partner.revenueInCheonwon != null && (
          <span className="flex items-center gap-1">
            <LuTrendingUp className="text-brand h-3.5 w-3.5" />
            {formatRevenue(partner.revenueInCheonwon)}
          </span>
        )}
        {stats.length > 0 && <span>{stats.join(' · ')}</span>}
      </div>

      <div className="mt-3 space-y-2">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={cn('text-ink-600 text-[13px] leading-relaxed', !featured && 'line-clamp-2')}
          >
            {p}
          </p>
        ))}
      </div>

      {featured && partner.requiredPartnerSkills.length > 0 && (
        <div className="mt-3.5">
          <p className="text-ink-700 text-[13px] font-semibold">필요한 파트너사</p>
          <p className="text-ink-500 mt-1 text-[13px]">
            {partner.requiredPartnerSkills.join(' · ')}
            {duration && <span className="text-ink-400"> / {duration}</span>}
          </p>
        </div>
      )}

      {featured ? (
        <>
          {partner.capabilityTags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {partner.capabilityTags.map((t) => (
                <span
                  key={t}
                  className="bg-brand-soft text-brand-sub02 rounded-full px-2.5 py-1 text-[12px] font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {partner.matchRate != null && (
            <div className="mt-4 flex items-center gap-2.5">
              <LuZap className="text-brand h-4 w-4 shrink-0 fill-current" />
              <span className="text-brand shrink-0 text-[13px] font-semibold">적합도</span>
              <ProgressBar value={partner.matchRate} tone="brand" className="flex-1" />
              <span className="text-brand shrink-0 text-[15px] font-bold">{partner.matchRate}%</span>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Link
              href={detailHref}
              className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'flex-1')}
            >
              협업 제안하기
            </Link>
            <Link
              href={detailHref}
              aria-label="상세보기"
              className="bg-ink-100 text-ink-500 flex h-13 w-13 shrink-0 items-center justify-center rounded-xl"
            >
              <LuChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {partner.capabilityTags.map((t) => (
              <span
                key={t}
                className="bg-brand-soft text-brand-sub02 rounded-full px-2.5 py-1 text-[12px] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
          <Link href={detailHref} aria-label="상세보기" className="flex shrink-0 items-center gap-2">
            <span className="text-ink-500 text-[13px] font-semibold">상세보기</span>
            <span className="bg-ink-100 text-ink-500 flex h-7 w-7 items-center justify-center rounded-lg">
              <LuChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}
    </Card>
  );
};

// 천원 단위 연매출 → "연매출 28억"·"연매출 5,000만" 표시. (표현 변환 = ui)
function formatRevenue(cheonwon: number): string {
  const won = cheonwon * 1000;
  if (won >= 1e8) {
    const eok = won / 1e8;
    return `연매출 ${Number.isInteger(eok) ? eok : eok.toFixed(1)}억`;
  }
  return `연매출 ${Math.round(won / 1e4).toLocaleString()}만`;
}

// 설립일 → "업력 N년차"(설립 첫해가 1년차). 공개 안 됐으면 null. (표현 변환 = ui)
function formatYearsInBusiness(foundedDate: Date | null): string | null {
  if (!foundedDate) return null;
  const years = differenceInCalendarYears(new Date(), foundedDate) + 1;
  return `업력 ${years}년차`;
}

// 마감 D-day 라벨 — 7일 이내일 때만 강조 표기(그 외엔 배지 없음).
function deadlineDday(deadline: Date | null): string | null {
  const days = daysUntilDeadline(deadline);
  if (days == null || days > 7) return null;
  return days === 0 ? '오늘 마감' : `마감 D-${days}`;
}

function formatDuration(start: Date | null, end: Date | null): string | null {
  if (!start || !end) return null;
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  return `예상 기간 ${months}개월`;
}
