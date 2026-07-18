'use client';

import { useTransition } from 'react';
import { LuFileText, LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { getSignupDocumentUrlAction } from '../commands/get-signup-document-url.action';

interface DocumentButtonProps {
  attachmentId: string;
}

// 첨부 서류 열람 버튼 — 서명 URL 발급 액션을 거쳐 새 탭에서 연다(만료형 링크).
export const DocumentButton = ({ attachmentId }: DocumentButtonProps) => {
  const [isPending, startTransition] = useTransition();

  function open() {
    startTransition(async () => {
      const result = await getSignupDocumentUrlAction({ attachmentId });
      if (result.ok) window.open(result.data.url, '_blank', 'noopener');
      else toast.error(result.message);
    });
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={isPending}
      className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
    >
      {isPending ? (
        <LuLoaderCircle className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LuFileText className="h-3.5 w-3.5" />
      )}
      열람
    </button>
  );
};
