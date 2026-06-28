import {
  LuBadgeCheck,
  LuChevronRight,
  LuMapPin,
  LuShield,
  LuStar,
  LuTrendingUp,
  LuUsers,
  LuZap,
} from 'react-icons/lu';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { MatchBadge, Partner } from '../mock';

// 예상 승률 강조 박스 — 톤별 틴트(그린/앰버) + 승률 게이지(겹친 라벨) + 코너 매칭 배지.
type WinRateTone = 'green' | 'amber';

const WIN_RATE_TONE: Record<
  WinRateTone,
  { box: string; icon: string; track: string; fill: string; label: string }
> = {
  green: {
    box: 'border-emerald-100 bg-emerald-50/70',
    icon: 'text-brand',
    track: 'bg-emerald-100',
    fill: 'bg-emerald-200',
    label: 'text-brand-sub02',
  },
  amber: {
    box: 'border-amber-100 bg-amber-50/70',
    icon: 'text-amber-500',
    track: 'bg-amber-100',
    fill: 'bg-amber-200',
    label: 'text-amber-600',
  },
};

interface WinRateBoxProps {
  winRate: number;
  note: string;
  tone: WinRateTone;
  badge: MatchBadge;
}

const WinRateBox = ({ winRate, note, tone, badge }: WinRateBoxProps) => {
  const t = WIN_RATE_TONE[tone];
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border p-2.5', t.box)}>
      <LuZap className={cn('mt-1 h-5 w-5 shrink-0 fill-current', t.icon)} />
      <div className="min-w-0 flex-1">
        <div className={cn('relative h-7 overflow-hidden rounded-full', t.track)}>
          <div
            className={cn('absolute inset-y-0 left-0 rounded-full', t.fill)}
            style={{ width: `${winRate}%` }}
          />
          <div
            className={cn(
              'absolute inset-0 flex items-center gap-1 px-3 text-[13px] font-bold',
              t.label,
            )}
          >
            <LuTrendingUp className="h-3.5 w-3.5" />
            예상 승률 {winRate}%
          </div>
        </div>
        <p className="text-ink-400 mt-1.5 px-1 text-[11px]">{note}</p>
      </div>
      <Badge
        variant={badge.tone === 'green' ? 'success' : 'warning'}
        size="sm"
        className="mt-0.5 shrink-0"
      >
        {badge.label}
      </Badge>
    </div>
  );
};

// 파트너 기업 카드 — 식별 헤더·메타·설명·필요 파트너·태그·매출·승률·CTA.
interface PartnerCardProps {
  partner: Partner;
}

export const PartnerCard = ({ partner }: PartnerCardProps) => {
  const {
    initial,
    avatarClass,
    name,
    verified,
    rating,
    reviewCount,
    industry,
    location,
    years,
    headcount,
    descriptions,
    neededPartners,
    tags,
    revenue,
    winRate,
    winRateNote,
    winRateTone,
    matchBadge,
  } = partner;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar fallback={initial} className={avatarClass} />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-ink-900 truncate text-[17px] font-bold">{name}</h3>
              {verified && <LuBadgeCheck className="text-brand h-4 w-4 shrink-0" />}
            </div>
            <p className="text-ink-500 mt-0.5 text-[13px]">{industry}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1">
            <LuStar className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-ink-900 text-[15px] font-bold">{rating}</span>
          </div>
          <p className="text-ink-400 mt-0.5 text-[11px]">리뷰 {reviewCount}</p>
        </div>
      </div>

      <div className="text-ink-400 mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
        <span className="flex items-center gap-1">
          <LuMapPin className="h-3.5 w-3.5" />
          {location}
        </span>
        <span className="text-ink-300">·</span>
        <span>{years}</span>
        <span className="text-ink-300">·</span>
        <span className="flex items-center gap-1">
          <LuUsers className="h-3.5 w-3.5" />
          {headcount}
        </span>
      </div>

      <div className="mt-3.5 space-y-3.5">
        <div className="space-y-2">
          {descriptions.map((d) => (
            <p key={d} className="text-ink-600 text-[13px] leading-relaxed">
              {d}
            </p>
          ))}
        </div>

        {neededPartners && (
          <div>
            <p className="text-ink-700 text-[13px] font-semibold">필요한 파트너사</p>
            <p className="text-ink-500 mt-1 text-[13px]">
              {neededPartners.roles}
              <span className="text-ink-400"> / {neededPartners.duration}</span>
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="bg-ink-100 text-ink-600 rounded-full px-2.5 py-1 text-[12px] font-medium"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="bg-ink-50 flex items-center gap-1.5 rounded-xl px-3 py-2.5">
          <LuTrendingUp className="text-brand h-4 w-4" />
          <span className="text-ink-600 text-[13px] font-medium">{revenue}</span>
        </div>

        <WinRateBox winRate={winRate} note={winRateNote} tone={winRateTone} badge={matchBadge} />
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="primary" size="lg" className="flex-1">
          <LuShield className="h-4 w-4" />
          제안하기
        </Button>
        <button
          type="button"
          aria-label="자세히 보기"
          className="bg-ink-100 text-ink-500 flex h-13 w-13 shrink-0 items-center justify-center rounded-xl"
        >
          <LuChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
};
