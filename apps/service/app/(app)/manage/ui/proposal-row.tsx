'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronRight, LuLoaderCircle } from 'react-icons/lu';

import { Badge } from '@/components/ui/badge';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { markProposalViewedAction } from '../commands/mark-proposal-viewed.action';
import type { ManageProposalView, ProposalStatus } from '../queries/manage-proposals.query';

// 제안 상태 → 배지 라벨/색 (소비 컴포넌트 로컬 사전).
const STATUS_META: Record<
  ProposalStatus,
  { label: string; variant: 'danger' | 'secondary' | 'success' }
> = {
  unread: { label: '미열람', variant: 'danger' },
  viewed: { label: '열람', variant: 'secondary' },
  replied: { label: '회신 완료', variant: 'success' },
};

interface ProposalRowProps {
  proposal: ManageProposalView;
}

export const ProposalRow = ({ proposal }: ProposalRowProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const status = STATUS_META[proposal.status];

  function open() {
    startTransition(async () => {
      await markProposalViewedAction({ proposalId: proposal.id });
      router.push(`/collab/${proposal.postId}`);
    });
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={isPending}
      className="shadow-card flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left transition-colors disabled:opacity-60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-ink-900 text-[15px] font-bold">{proposal.proposerCompanyName}</h3>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="text-ink-700 mt-1 truncate text-sm">{proposal.postTitle}</p>
        <p className="text-ink-500 mt-1 line-clamp-1 text-[13px]">{proposal.message}</p>
        <p className="text-ink-400 mt-2 text-[12px]">{formatRelativeKorean(proposal.createdAt)}</p>
      </div>
      {isPending ? (
        <LuLoaderCircle className="text-ink-300 h-5 w-5 shrink-0 animate-spin" />
      ) : (
        <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />
      )}
    </button>
  );
};
