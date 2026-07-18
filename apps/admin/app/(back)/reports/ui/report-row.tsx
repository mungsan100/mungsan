import Link from 'next/link';
import type { DB } from '@mungsan/db';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import type { ReportListView } from '../queries/reports-list.query';

// 신고 대상/사유/상태 → 표시 라벨. 표시 매핑이라 소비처(ui) 로컬.
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

const STATUS_META: Record<DB.ReportStatus, { label: string; className: string }> = {
  PENDING: { label: '대기', className: 'bg-amber-100 text-amber-800' },
  CONTENT_HIDDEN: { label: '숨김 처리', className: 'bg-emerald-100 text-emerald-800' },
  DISMISSED: { label: '반려', className: 'bg-slate-200 text-slate-600' },
};

interface ReportRowProps {
  report: ReportListView;
}

export const ReportRow = ({ report }: ReportRowProps) => {
  const status = STATUS_META[report.status];

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3">
        <Link
          href={`/reports/${report.id}`}
          className="font-semibold text-slate-900 hover:underline"
        >
          {TARGET_LABELS[report.targetType]}
        </Link>
      </td>
      <td className="px-4 py-3 text-slate-700">
        {REASON_LABELS[report.reason]}
        {report.detail && (
          <span className="ml-1 max-w-48 truncate align-middle text-xs text-slate-400">
            — {report.detail}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-700">{report.reporterName}</td>
      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
        {formatKstDateTime(report.createdAt)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/reports/${report.id}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          상세 →
        </Link>
      </td>
    </tr>
  );
};
