import { LuStar, LuTrendingUp } from 'react-icons/lu';

import { cn } from '@/lib/utils';

import type { TrustScore } from '../mock';
import { TrustGauge } from './trust-gauge';

// Trust Score 카드 — 헤더 그린 위에 얹는 더 어두운 그린 카드.
// 좌측 반원 게이지 + 우측 5개 지표 바 + 하단 등급/추이 알약.
interface TrustScoreCardProps {
  data: TrustScore;
}

export const TrustScoreCard = ({ data }: TrustScoreCardProps) => {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-emerald-950/40 p-4">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="text-[15px] font-bold text-white">Trust Score (신뢰 지수)</span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <TrustGauge score={data.score} max={data.max} />
        <div className="min-w-0 flex-1 space-y-2.5">
          {data.metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-white/70">{metric.label}</span>
                <span className="font-bold text-white">
                  {metric.value}
                  <span className="font-medium text-white/45">/{metric.max}</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className={cn(
                    'h-full rounded-full',
                    metric.tone === 'danger' ? 'bg-red-400' : 'bg-emerald-400',
                  )}
                  style={{ width: `${(metric.value / metric.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-full bg-white/10 px-4 py-2">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/90">
          <LuStar className="h-3.5 w-3.5 text-amber-300" />
          {data.rankLabel}
        </span>
        <span className="flex items-center gap-1 text-[12.5px] font-semibold text-emerald-300">
          <LuTrendingUp className="h-3.5 w-3.5" />
          {data.deltaLabel}
        </span>
      </div>
    </div>
  );
};
