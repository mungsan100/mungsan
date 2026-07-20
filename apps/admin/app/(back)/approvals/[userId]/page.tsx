import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { DB } from '@mungsan/db';

import { formatKstDateTime } from '@/lib/datetime/format-kst';
import { formatBrnDisplay } from '@/lib/format/business-registration-no';

import { getSignupDetailQuery } from './queries/signup-detail.query';
import { DecisionPanel } from './ui/decision-panel';
import { DocumentButton } from './ui/document-button';

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

// 첨부 도메인 구분 → 표시 라벨.
const KIND_LABELS: Record<DB.AttachmentKind, string> = {
  BUSINESS_CERT: '사업자등록증',
  EXECUTIVE_PROOF: '임원 증빙',
  BROCHURE: '회사 소개서',
  POST_ATTACHMENT: '공고 첨부',
  PROPOSAL_ATTACHMENT: '제안 참고 자료', // COMPANY 소유 조회에는 안 나옴 — 타입 완전성용
};

// 가입 신청 상세 — 기업·신청자 정보 + 첨부 서류 열람 + 승인/반려 처리.
export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <main className="space-y-6">
      <Link href="/approvals" className="text-sm text-slate-500 hover:text-slate-900">
        ← 심사 목록으로
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <DetailSection params={params} />
      </Suspense>
    </main>
  );
}

async function DetailSection({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const detail = await getSignupDetailQuery(userId);
  if (!detail) notFound();

  const roleLabel =
    detail.executiveRole === 'OTHER' && detail.jobTitle
      ? detail.jobTitle
      : ROLE_LABELS[detail.executiveRole];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-900">{detail.companyName}</h1>
        {detail.revisions.length > 0 && (
          <span className="inline-block rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
            재심사 — 회사 정보 수정
          </span>
        )}
      </div>

      {/* 동일 사업자번호 타 계정 경고(2026-07-20 중복 방지) — 승인 건이 있으면 승인이 거부된다. */}
      {(detail.brnDuplicates.approvedCount > 0 || detail.brnDuplicates.pendingCount > 0) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-bold text-red-700">
            ⚠ 동일 사업자등록번호의 다른 계정 —{' '}
            {detail.brnDuplicates.approvedCount > 0 &&
              `이미 승인 ${detail.brnDuplicates.approvedCount}건`}
            {detail.brnDuplicates.approvedCount > 0 && detail.brnDuplicates.pendingCount > 0 && ' · '}
            {detail.brnDuplicates.pendingCount > 0 && `심사 대기 ${detail.brnDuplicates.pendingCount}건`}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            {detail.brnDuplicates.approvedCount > 0
              ? '승인된 계정이 이미 있어 이 신청의 승인은 차단됩니다. 중복·도용 여부를 확인해 주세요.'
              : '같은 번호의 신청이 여러 건입니다. 먼저 승인되는 한 곳만 통과되고 나머지는 차단됩니다.'}
          </p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-900">기업 정보</h2>
          <dl className="space-y-3">
            <InfoRow label="회사명" value={detail.companyName} />
            <InfoRow label="사업자등록번호" value={formatBrnDisplay(detail.businessRegistrationNo)} />
            <InfoRow label="업종" value={detail.industryName} />
            <InfoRow label="기업정보 제출일" value={formatKstDateTime(detail.appliedAt)} />
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-900">신청자 정보</h2>
          <dl className="space-y-3">
            <InfoRow label="이름" value={`${detail.applicantName} (${roleLabel})`} />
            <InfoRow label="이메일" value={detail.email} />
            <InfoRow label="연락처" value={detail.phone} />
            <InfoRow label="회원가입일" value={formatKstDateTime(detail.signedUpAt)} />
          </dl>
        </section>
      </div>

      {detail.revisions.length > 0 && (
        <section className="rounded-xl border border-violet-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-bold text-slate-900">회사 정보 변경 이력</h2>
          <p className="mb-4 text-xs text-slate-500">
            회원이 회사 정보를 수정하면 승인이 되돌려지고 재심사 대기로 등록됩니다. 아래는 수정
            시점의 이전 값 → 새 값입니다(최신순).
          </p>
          <ul className="space-y-3">
            {detail.revisions.map((revision) => (
              <li key={revision.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  {formatKstDateTime(revision.revisedAt)} 수정
                </p>
                <dl className="space-y-1">
                  <ChangeRow
                    label="회사명"
                    before={revision.nameBefore}
                    after={revision.nameAfter}
                  />
                  <ChangeRow
                    label="사업자등록번호"
                    before={formatBrnDisplay(revision.businessRegistrationNoBefore)}
                    after={formatBrnDisplay(revision.businessRegistrationNoAfter)}
                  />
                  <ChangeRow
                    label="업종"
                    before={revision.industryNameBefore}
                    after={revision.industryNameAfter}
                  />
                </dl>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">첨부 서류</h2>
        {detail.attachments.length === 0 ? (
          <p className="text-sm text-slate-500">첨부된 서류가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {detail.attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {KIND_LABELS[attachment.kind]}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {attachment.fileName}
                    {attachment.size != null && ` · ${formatFileSize(attachment.size)}`}
                  </p>
                </div>
                <DocumentButton attachmentId={attachment.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">심사 처리</h2>
        {detail.status === 'APPROVED' ? (
          <p className="text-sm text-emerald-700">
            승인 완료 — {detail.approvedAt && formatKstDateTime(detail.approvedAt)}
          </p>
        ) : (
          <DecisionPanel
            userId={detail.userId}
            status={detail.status}
            rejectedAt={detail.rejectedAt}
            rejectedReason={detail.rejectedReason}
          />
        )}
      </section>
    </div>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <dt className="w-32 shrink-0 text-sm text-slate-400">{label}</dt>
    <dd className="text-sm break-all text-slate-900">{value}</dd>
  </div>
);

// 변경 이력 한 줄 — 값이 그대로면 "변경 없음"으로 흐리게, 바뀌었으면 이전 → 새 값을 강조.
const ChangeRow = ({ label, before, after }: { label: string; before: string; after: string }) => (
  <div className="flex flex-wrap gap-3 text-sm">
    <dt className="w-32 shrink-0 text-slate-400">{label}</dt>
    {before === after ? (
      <dd className="text-slate-400">변경 없음 ({after})</dd>
    ) : (
      <dd className="break-all text-slate-900">
        <span className="text-slate-500 line-through">{before}</span>
        <span className="mx-1.5 text-slate-400">→</span>
        <span className="font-semibold text-violet-700">{after}</span>
      </dd>
    )}
  </div>
);

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

const DetailSkeleton = () => (
  <div className="space-y-5">
    <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
    <div className="grid gap-5 md:grid-cols-2">
      <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
    </div>
    <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
  </div>
);
