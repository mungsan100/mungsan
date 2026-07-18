import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { DB } from '@mungsan/db';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import { getReportDetailQuery, type ReportTargetState } from './queries/report-detail.query';
import { ReportDecisionPanel } from './ui/report-decision-panel';

// 신고 대상/사유 → 표시 라벨. 표시 매핑이라 소비처(ui) 로컬.
const TARGET_LABELS: Record<DB.ReportTargetType, string> = {
  LOUNGE_POST: '라운지 글',
  LOUNGE_COMMENT: '라운지 댓글',
  COLLABORATION_POST: '협업 공고',
};

const REASON_LABELS: Record<DB.ReportReason, string> = {
  SPAM: '스팸/광고',
  ABUSE: '욕설/비방',
  FALSE_INFO: '허위정보',
  OTHER: '기타',
};

const TARGET_STATE_META: Record<ReportTargetState, { label: string; className: string }> = {
  ACTIVE: { label: '공개 중', className: 'bg-emerald-100 text-emerald-800' },
  HIDDEN: { label: '숨김 상태', className: 'bg-amber-100 text-amber-800' },
  DELETED: { label: '삭제됨', className: 'bg-slate-200 text-slate-600' },
  NOT_FOUND: { label: '존재하지 않음', className: 'bg-slate-200 text-slate-600' },
};

// 신고 상세 — 신고 정보 + 신고 시점 스냅샷 + 대상 현재 상태/원문 + 처리 패널.
export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  return (
    <main className="space-y-6">
      <Link href="/reports" className="text-sm text-slate-500 hover:text-slate-900">
        ← 신고 목록으로
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <DetailSection params={params} />
      </Suspense>
    </main>
  );
}

async function DetailSection({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const detail = await getReportDetailQuery(reportId);
  if (!detail) notFound();

  const targetState = TARGET_STATE_META[detail.targetState];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">
        {TARGET_LABELS[detail.targetType]} 신고
      </h1>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">신고 정보</h2>
        <dl className="space-y-3">
          <InfoRow label="사유" value={REASON_LABELS[detail.reason]} />
          {detail.detail && <InfoRow label="상세 사유" value={detail.detail} />}
          <InfoRow label="신고자" value={`${detail.reporterName} (${detail.reporterEmail})`} />
          <InfoRow label="신고일시" value={formatKstDateTime(detail.createdAt)} />
          {detail.pendingCountForTarget > 1 && detail.status === 'PENDING' && (
            <InfoRow
              label="같은 대상 신고"
              value={`대기 ${detail.pendingCountForTarget}건 — 숨김 처리 시 함께 종료됩니다`}
            />
          )}
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">신고 시점 내용 (스냅샷)</h2>
        </div>
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm whitespace-pre-wrap text-slate-700">
          {detail.contentSnapshot}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">현재 원문</h2>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${targetState.className}`}
          >
            {targetState.label}
          </span>
        </div>
        {detail.currentContent ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm whitespace-pre-wrap text-slate-700">
            {detail.currentContent}
          </p>
        ) : (
          <p className="text-sm text-slate-500">원문을 조회할 수 없습니다(삭제됨).</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">처리</h2>
        <ReportDecisionPanel
          reportId={detail.id}
          status={detail.status}
          resolvedAt={detail.resolvedAt}
        />
      </section>
    </div>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <dt className="w-28 shrink-0 text-sm text-slate-400">{label}</dt>
    <dd className="text-sm break-all text-slate-900">{value}</dd>
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-5">
    <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
    <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
    <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
  </div>
);
