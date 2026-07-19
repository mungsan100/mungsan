import { Suspense } from 'react';

import {
  getMetricsSummaryQuery,
  getWeeklyMetricsQuery,
  type WeeklyRow,
} from './queries/metrics.query';

// 지표 대시보드(P1) — 요약 4종 + 최근 8주(KST) 주간 추이(가입·공고·제안·신고).
// 외부 차트 라이브러리 없이 표 + 인라인 막대로 표현한다(admin 톤).
export default function MetricsPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">지표</h1>
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsContent />
      </Suspense>
    </main>
  );
}

const SERIES: { key: keyof Pick<WeeklyRow, 'signups' | 'collabPosts' | 'proposals' | 'reports'>; label: string; barClass: string }[] = [
  { key: 'signups', label: '가입', barClass: 'bg-emerald-500' },
  { key: 'collabPosts', label: '협업 공고', barClass: 'bg-sky-500' },
  { key: 'proposals', label: '제안', barClass: 'bg-violet-500' },
  { key: 'reports', label: '신고', barClass: 'bg-red-500' },
];

async function MetricsContent() {
  const [summary, weekly] = await Promise.all([
    getMetricsSummaryQuery(),
    getWeeklyMetricsQuery(),
  ]);
  // 인라인 막대 비율의 분모 — 시리즈 전체 최대값(0 나눗셈 방지로 최소 1).
  const maxValue = Math.max(1, ...weekly.flatMap((row) => SERIES.map((s) => row[s.key])));

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="전체 회원" value={summary.totalMembers} note="탈퇴 제외" />
        <SummaryCard label="활성 공고" value={summary.activeCollabPosts} note="공개·노출 중" />
        <SummaryCard label="누적 제안" value={summary.totalProposals} note="제출 기준" />
        <SummaryCard
          label="대기 신고"
          value={summary.pendingReports}
          note="처리 필요"
          highlight={summary.pendingReports > 0}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">주간 추이 (최근 8주, KST 월요일 시작)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="py-2 pr-4 font-semibold">주</th>
                {SERIES.map((s) => (
                  <th key={s.key} className="min-w-36 py-2 pr-4 font-semibold">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekly.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="py-2 pr-4 whitespace-nowrap text-slate-500">{row.label}</td>
                  {SERIES.map((s) => (
                    <td key={s.key} className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${s.barClass}`}
                            style={{ width: `${(row[s.key] / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className="tabular-nums font-semibold text-slate-700">
                          {row[s.key]}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const SummaryCard = ({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string;
  value: number;
  note: string;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-xl border p-4 ${
      highlight ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
    }`}
  >
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-red-700' : 'text-slate-900'}`}>
      {value.toLocaleString()}
    </p>
    <p className="mt-0.5 text-xs text-slate-400">{note}</p>
  </div>
);

const MetricsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
    <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
  </div>
);
