'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronRight, LuFileText, LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import type { DB } from '@mungsan/db';

import { Badge } from '@/components/ui/badge';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { getProposalAttachmentUrlAction } from '../commands/get-proposal-attachment-url.action';
import { markProposalViewedAction } from '../commands/mark-proposal-viewed.action';
import {
  respondProposalAction,
  type ProposalResponse,
} from '../commands/respond-proposal.action';
import type { ManageProposalView } from '../queries/manage-proposals.query';

// 제안 상태(ProposalStatus) → 배지 라벨/색 (소비 컴포넌트 로컬 사전).
const STATUS_META: Record<
  DB.ProposalStatus,
  { label: string; variant: 'danger' | 'secondary' | 'success' | 'default' }
> = {
  DRAFT: { label: '임시저장', variant: 'secondary' }, // 받은제안 목록엔 안 나옴(쿼리에서 제외) — 타입 완전성용
  SUBMITTED: { label: '제안 완료', variant: 'danger' },
  UNDER_REVIEW: { label: '검토 중', variant: 'secondary' },
  ACCEPTED: { label: '수락', variant: 'success' },
  REJECTED: { label: '반려', variant: 'default' },
  MEETING_REQUESTED: { label: '미팅 요청', variant: 'success' },
  IN_PROGRESS: { label: '협업 진행 중', variant: 'success' },
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

  function respond(response: ProposalResponse) {
    startTransition(async () => {
      const result = await respondProposalAction({ proposalId: proposal.id, response });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function openAttachment(attachmentId: string) {
    startTransition(async () => {
      const result = await getProposalAttachmentUrlAction({ attachmentId });
      if (result.ok) window.open(result.data.url, '_blank', 'noopener');
      else toast.error(result.message);
    });
  }

  return (
    <div className="shadow-card rounded-2xl bg-white p-4">
      <button
        type="button"
        onClick={open}
        disabled={isPending}
        className="flex w-full items-center gap-3 text-left disabled:opacity-60"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-ink-900 text-[15px] font-bold">{proposal.proposerCompanyName}</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-ink-700 mt-1 truncate text-sm">{proposal.postTitle}</p>
          <p className="text-ink-500 mt-1 line-clamp-1 text-[13px]">{proposal.message}</p>
          {proposal.contributionRole && (
            <p className="text-ink-500 mt-0.5 line-clamp-1 text-[13px]">
              기여 역할: {proposal.contributionRole}
            </p>
          )}
          <p className="text-ink-400 mt-2 text-[12px]">{formatRelativeKorean(proposal.createdAt)}</p>
        </div>
        {isPending ? (
          <LuLoaderCircle className="text-ink-300 h-5 w-5 shrink-0 animate-spin" />
        ) : (
          <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />
        )}
      </button>

      <div className="border-ink-100 mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        {proposal.attachments.map((attachment) => (
          <button
            key={attachment.id}
            type="button"
            onClick={() => openAttachment(attachment.id)}
            disabled={isPending}
            title={attachment.fileName}
            className="border-ink-200 text-ink-600 flex max-w-44 items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-[12px] font-semibold disabled:opacity-60"
          >
            <LuFileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{attachment.fileName}</span>
          </button>
        ))}
        {proposal.respondable && (
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => respond('MEETING_REQUESTED')}
              disabled={isPending}
              className="border-ink-200 text-ink-700 rounded-lg border bg-white px-2.5 py-1.5 text-[12px] font-semibold disabled:opacity-60"
            >
              미팅 요청
            </button>
            <button
              type="button"
              onClick={() => respond('REJECTED')}
              disabled={isPending}
              className="border-ink-200 text-ink-700 rounded-lg border bg-white px-2.5 py-1.5 text-[12px] font-semibold disabled:opacity-60"
            >
              반려
            </button>
            <button
              type="button"
              onClick={() => respond('ACCEPTED')}
              disabled={isPending}
              className="bg-brand rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
            >
              수락
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
