import type { TrustScore } from '@mungsan/trust';

// admin 회원 상세 신뢰 지수 패널 — service 관리 화면과 동일 점수·등급·4지표를 admin 톤(slate)으로.
// 등급별 배지 색상(service Badge와 의미 일치): 우수=emerald, 양호=sky, 보통=amber, 관리필요=red.
const GRADE_CLASS: Record<string, string> = {
  '신뢰 우수': 'bg-emerald-100 text-emerald-700',
  '신뢰 양호': 'bg-sky-100 text-sky-700',
  '신뢰 보통': 'bg-amber-100 text-amber-700',
  '신뢰 관리 필요': 'bg-red-100 text-red-700',
};

export function TrustScorePanel({ trust }: { trust: TrustScore }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">신뢰 지수</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            GRADE_CLASS[trust.grade] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {trust.grade}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">{trust.score}</span>
        <span className="text-sm text-slate-400">/ {trust.max}</span>
      </div>

      <dl className="mt-4 space-y-3">
        {trust.metrics.map((metric) => (
          <div key={metric.key}>
            <div className="flex items-center justify-between text-[13px]">
              <dt className="text-slate-600">{metric.label}</dt>
              <dd className="font-bold text-slate-900">
                {metric.value}
                <span className="font-medium text-slate-400">/{metric.max}</span>
              </dd>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(metric.value / metric.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
