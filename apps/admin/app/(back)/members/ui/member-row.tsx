import Link from 'next/link';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import type { MemberListItem } from '../queries/members.query';
import { DeleteMemberButton } from './delete-member-button';

// 회원 상태 배지 — 시각 presence 파생. 우선순위: 탈퇴 > 정지 > 활성 > 심사중.
export function memberStatus(member: {
  approvedAt: Date | null;
  suspendedAt: Date | null;
  withdrawnAt: Date | null;
}): { label: string; className: string } {
  if (member.withdrawnAt) return { label: '탈퇴', className: 'bg-slate-100 text-slate-500' };
  if (member.suspendedAt) return { label: '정지', className: 'bg-red-100 text-red-700' };
  if (member.approvedAt) return { label: '활성', className: 'bg-emerald-100 text-emerald-700' };
  return { label: '심사중', className: 'bg-amber-100 text-amber-700' };
}

export const MemberRow = ({ member }: { member: MemberListItem }) => {
  const status = memberStatus(member);

  return (
    <tr className="border-t border-slate-100">
      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{member.name}</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{member.email}</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{member.companyName ?? '—'}</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{member.industryName ?? '—'}</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatKstDateTime(member.createdAt)}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/members/${member.userId}`}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            상세
          </Link>
          {/* 이미 탈퇴한 회원에겐 삭제 버튼 미표시(중복 조치 방지). */}
          {!member.withdrawnAt && (
            <DeleteMemberButton userId={member.userId} memberName={member.name} />
          )}
        </div>
      </td>
    </tr>
  );
};
