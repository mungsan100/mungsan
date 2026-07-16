'use client';

import { useTransition } from 'react';
import { LuFileText, LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { getPostAttachmentUrlAction } from '../../commands/get-post-attachment-url.action';

interface AttachmentListProps {
  attachments: { id: string; fileName: string; size: number | null }[];
}

// 공고 첨부 목록 — 클릭 시 서명 URL을 발급받아 새 탭으로 연다(blob이 private-only라 직링크 없음).
export const AttachmentList = ({ attachments }: AttachmentListProps) => {
  const [isPending, startTransition] = useTransition();

  function open(attachmentId: string) {
    startTransition(async () => {
      const result = await getPostAttachmentUrlAction({ attachmentId });
      if (result.ok) window.open(result.data.url, '_blank', 'noopener');
      else toast.error(result.message);
    });
  }

  return (
    <div className="mt-4">
      <p className="text-ink-700 text-[13px] font-semibold">첨부파일</p>
      <ul className="mt-2 space-y-1.5">
        {attachments.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => open(a.id)}
              disabled={isPending}
              className="border-ink-200 text-ink-700 flex w-full items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-left text-[13px] font-medium disabled:opacity-60"
            >
              {isPending ? (
                <LuLoaderCircle className="text-ink-400 h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <LuFileText className="text-ink-400 h-4 w-4 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate">{a.fileName}</span>
              {a.size != null && (
                <span className="text-ink-400 shrink-0 text-[12px]">{formatSize(a.size)}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
