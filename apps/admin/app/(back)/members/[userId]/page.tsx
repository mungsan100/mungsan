import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { formatKstDateTime } from '@/lib/datetime/format-kst';
import { formatBrnDisplay } from '@/lib/format/business-registration-no';

import { memberStatus } from '../ui/member-row';
import { getMemberDetailQuery } from './queries/member-detail.query';
import { SuspendPanel } from './ui/suspend-panel';

// 임원 직책 → 표시 라벨(approvals 상세와 동일 매핑).
const ROLE_LABELS: Record<string, string> = {
  CEO: 'CEO',
  COO: 'COO',
  CTO: 'CTO',
  CFO: 'CFO',
  CMO: 'CMO',
  CISO: 'CISO',
  CPO: 'CPO',
  FOUNDER: '창업자',
  CHAIRMAN: '회장',
  OTHER: '기타',
};

// 회원 상세 — 인적·회사 정보 + 활동 요약 + 상태 이력 + 이용 정지/해제.
export default function MemberDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  return (
    <main className="space-y-6">
      <Link href="/members" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
        ← 회원 목록
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <MemberDetailContent params={params} />
      </Suspense>
    </main>
  );
}

async function MemberDetailContent({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const member = await getMemberDetailQuery(userId);
  if (!member) notFound();

  const status = memberStatus(member);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">회원 정보</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <InfoRow label="이메일" value={member.email} />
            <InfoRow label="연락처" value={member.phone} />
            <InfoRow
              label="직책"
              value={
                member.executiveRole === 'OTHER'
                  ? (member.jobTitle ?? ROLE_LABELS.OTHER)
                  : ROLE_LABELS[member.executiveRole]
              }
            />
            <InfoRow label="가입일" value={formatKstDateTime(member.createdAt)} />
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">회사 정보</h2>
          {member.company ? (
            <dl className="mt-3 space-y-2 text-sm">
              <InfoRow label="회사명" value={member.company.name} />
              <InfoRow
                label="사업자등록번호"
                value={formatBrnDisplay(member.company.businessRegistrationNo)}
              />
              <InfoRow label="업종" value={member.company.industryName} />
              <InfoRow label="지역" value={member.company.region ?? '—'} />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">등록된 회사 정보가 없습니다.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">활동 요약</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatBox label="라운지 글" value={member.activity.loungePosts} />
          <StatBox label="라운지 댓글" value={member.activity.loungeComments} />
          <StatBox label="협업 공고" value={member.activity.collabPosts} />
          <StatBox label="보낸 제안" value={member.activity.sentProposals} />
          <StatBox
            label="신고당한 횟수"
            value={member.activity.reportedCount}
            highlight={member.activity.reportedCount > 0}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">상태 이력</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <InfoRow
            label="가입 승인"
            value={member.approvedAt ? formatKstDateTime(member.approvedAt) : '미승인(심사중)'}
          />
          {member.rejectedAt && (
            <InfoRow label="가입 반려" value={formatKstDateTime(member.rejectedAt)} />
          )}
          {member.suspendedAt && (
            <InfoRow
              label="이용 정지"
              value={`${formatKstDateTime(member.suspendedAt)}${
                member.suspendedReason ? ` — 사유: ${member.suspendedReason}` : ''
              }`}
            />
          )}
          {member.withdrawnAt && (
            <InfoRow label="탈퇴" value={formatKstDateTime(member.withdrawnAt)} />
          )}
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">이용 정지</h2>
        <div className="mt-3">
          <SuspendPanel
            userId={member.userId}
            suspended={member.suspendedAt != null}
            withdrawn={member.withdrawnAt != null}
          />
        </div>
      </section>
    </div>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <dt className="w-28 shrink-0 text-slate-400">{label}</dt>
    <dd className="text-slate-700">{value}</dd>
  </div>
);

const StatBox = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-lg border px-3 py-2.5 ${
      highlight ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'
    }`}
  >
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-red-700' : 'text-slate-900'}`}>{value}</p>
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
    <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
  </div>
);
