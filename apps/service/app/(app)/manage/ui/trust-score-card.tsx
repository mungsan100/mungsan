import { getTrustScoreQuery } from '@/lib/trust/trust-score.query';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { TrustGauge } from './trust-gauge';

// 신뢰 지수 카드 — 실제 신호로 파생한 지수(getTrustScoreQuery). 반원 게이지 + 등급 배지 + 5개 지표.
export async function TrustScoreCard() {
  const user = await getCurrentUser();
  const trust = await getTrustScoreQuery(user.id);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <TrustGauge score={trust.score} max={trust.max} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <h2 className="text-ink-900 text-base font-bold">신뢰 지수</h2>
          <Badge size="md">{trust.grade}</Badge>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {trust.metrics.map((metric) => (
          <div key={metric.key}>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink-600">{metric.label}</span>
              <span className="text-ink-900 font-bold">
                {metric.value}
                <span className="text-ink-400 font-medium">/{metric.max}</span>
              </span>
            </div>
            <ProgressBar className="mt-1.5" value={(metric.value / metric.max) * 100} />
          </div>
        ))}
      </div>
    </Card>
  );
}
