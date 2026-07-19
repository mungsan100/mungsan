import Link from 'next/link';
import type { DB } from '@mungsan/db';

import { formatKstDateTime } from '@/lib/datetime/format-kst';
import { formatBrnDisplay } from '@/lib/format/business-registration-no';

import type { SignupApplicationView } from '../queries/signup-applications.query';

// 임원 직책 → 표시 라벨. 표시 매핑이라 소비처(ui) 로컬.
const ROLE_LABELS: Record<DB.ExecutiveRole, string> = {
  CEO: 'CEO',
  COO: 'COO',
  CTO: 'CTO',
  CFO: 'CFO',
  CMO: 'CMO',
  CISO: 'CISO',
  CPO: 'CPO',
  FOUNDER: '창업자',
  CHAIRMAN: '회장',
  OTHER: '임원',
};

const STATUS_META: Record<SignupApplicationView['status'], { label: string; className: string }> = {
  PENDING: { label: '심사 대기', className: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: '승인', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: '반려', className: 'bg-red-100 text-red-700' },
};

interface ApplicationRowProps {
  application: SignupApplicationView;
}

export const ApplicationRow = ({ application }: ApplicationRowProps) => {
  const status = STATUS_META[application.status];
  const roleLabel =
    application.executiveRole === 'OTHER' && application.jobTitle
      ? application.jobTitle
      : ROLE_LABELS[application.executiveRole];

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3">
        <Link
          href={`/approvals/${application.userId}`}
          className="font-semibold text-slate-900 hover:underline"
        >
          {application.companyName}
        </Link>
        {application.isRereview && (
          <span className="ml-2 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
            재심사
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {application.applicantName}
        <span className="ml-1 text-xs text-slate-400">{roleLabel}</span>
      </td>
      <td className="px-4 py-3 text-slate-700">{application.industryName}</td>
      <td className="px-4 py-3 tabular-nums text-slate-700">
        {formatBrnDisplay(application.businessRegistrationNo)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
        {formatKstDateTime(application.appliedAt)}
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
          href={`/approvals/${application.userId}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          상세 →
        </Link>
      </td>
    </tr>
  );
};
