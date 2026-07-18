import Link from 'next/link';
import { LuChevronRight, LuSend } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { SectionHeader } from '@/components/section-header';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { getSentProposalsQuery } from '../queries/sent-proposals.query';

// 제안 상태 → 표시 라벨/배지 톤 — 제안자 시점 문구(소비 컴포넌트 로컬 사전).
const STATUS_META: Record<
  DB.ProposalStatus,
  { label: string; variant: 'danger' | 'secondary' | 'success' | 'default' }
> = {
  DRAFT: { label: '임시저장', variant: 'secondary' }, // 쿼리에서 제외 — 타입 완전성용
  SUBMITTED: { label: '전달됨', variant: 'secondary' },
  UNDER_REVIEW: { label: '검토 중', variant: 'secondary' },
  ACCEPTED: { label: '수락', variant: 'success' },
  REJECTED: { label: '반려', variant: 'default' },
  MEETING_REQUESTED: { label: '미팅 요청', variant: 'success' },
  IN_PROGRESS: { label: '협업 진행 중', variant: 'success' },
};

// 보낸 제안 — 내가 다른 기업 공고에 보낸 제안들의 상태 확인(행 클릭 시 해당 공고로 이동).
export async function SentProposalSection() {
  const user = await getCurrentUser();
  const proposals = await getSentProposalsQuery(user.id);

  return (
    <section className="px-5">
      <SectionHeader icon={<LuSend className="h-[18px] w-[18px]" />} title="보낸 제안" />
      <div className="mt-3 space-y-3">
        {proposals.length === 0 ? (
          <p className="text-ink-400 py-8 text-center text-sm">아직 보낸 제안이 없습니다.</p>
        ) : (
          proposals.map((proposal) => {
            const status = STATUS_META[proposal.status];
            return (
              <Link
                key={proposal.id}
                href={`/collab/${proposal.postId}`}
                className="shadow-card flex items-center gap-3 rounded-2xl bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-ink-900 truncate text-[15px] font-bold">
                      {proposal.postCompanyName}
                    </h3>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="text-ink-700 mt-1 truncate text-sm">{proposal.postTitle}</p>
                  <p className="text-ink-400 mt-2 text-[12px]">
                    {formatRelativeKorean(proposal.createdAt)} 제안
                    {proposal.respondedAt && ` · ${formatRelativeKorean(proposal.respondedAt)} 응답`}
                  </p>
                </div>
                <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
