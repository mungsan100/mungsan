import { getTrustScoreQuery } from '@/lib/trust/trust-score.query';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { TrustGauge } from './trust-gauge';

// 지표별 "어떻게 올리나" 안내(2026-07-22) — 가이드가 없다는 피드백으로 추가. 산식 요지를 한 줄로.
const METRIC_HINTS: Record<string, string> = {
  profile: '아래 프로필의 회사 정보에서 소개·주요 실적·홈페이지·연매출·지역·인원·설립일·보유 역량을 채우면 올라가요.',
  activity: '라운지 글·댓글, 협업 공고·제안 활동 1건당 2점씩 올라가요(10건이면 만점).',
  response: '받은 협업 제안에 수락·반려로 응답하면 응답 비율만큼 올라가요(받은 제안이 없으면 기본 12점).',
  collaboration: '협업 프로젝트에 참여할 때마다 10점씩 올라가요(2건이면 만점).',
};

// 신뢰 지수 카드 — 실제 신호로 파생한 지수(getTrustScoreQuery). 반원 게이지 + 등급 배지 + 4개 지표.
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

      <div className="mt-5 space-y-4">
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
            {METRIC_HINTS[metric.key] && (
              <p className="text-ink-400 mt-1 text-[12px] leading-relaxed">
                {METRIC_HINTS[metric.key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
