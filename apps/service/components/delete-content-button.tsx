'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle, LuTrash2 } from 'react-icons/lu';
import { toast } from 'sonner';

import { deleteCollabPostAction } from '@/app/(app)/collab/commands/delete-collab-post.action';
import { deleteLoungePostAction } from '@/app/(app)/lounge/commands/delete-lounge-post.action';

// 대상별 액션·문구·삭제 후 이동 경로.
const TARGETS = {
  LOUNGE_POST: {
    action: deleteLoungePostAction,
    confirmTitle: '이 글을 삭제하시겠어요?',
    redirectTo: '/lounge',
  },
  COLLABORATION_POST: {
    action: deleteCollabPostAction,
    confirmTitle: '이 공고를 삭제하시겠어요?',
    redirectTo: '/collab',
  },
} as const;

interface DeleteContentButtonProps {
  target: keyof typeof TARGETS;
  postId: string;
}

// 본인 글/공고 삭제 버튼 + 인라인 확인 패널(ReportButton 미러) — 작성자 본인 화면에서만 렌더.
// 성공 시 목록으로 replace — 삭제된 상세는 쿼리가 걸러 뒤로가기로 재진입해도 404.
export const DeleteContentButton = ({ target, postId }: DeleteContentButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { action, confirmTitle, redirectTo } = TARGETS[target];

  function submit() {
    startTransition(async () => {
      const result = await action({ postId });
      if (!result.ok) {
        toast.error(result.message);
        setOpen(false);
        return;
      }
      toast.success(result.message);
      router.replace(redirectTo);
      router.refresh();
    });
  }

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-ink-400 hover:text-danger flex items-center gap-1 text-[13px]"
        aria-label="삭제"
      >
        <LuTrash2 className="h-3.5 w-3.5" />
        삭제
      </button>
    );

  return (
    <div className="border-ink-200 w-full space-y-3 rounded-xl border bg-white p-3 text-left">
      <div>
        <p className="text-ink-900 text-sm font-bold">{confirmTitle}</p>
        <p className="text-ink-500 mt-0.5 text-xs">
          삭제하면 목록에서 사라지며 되돌릴 수 없습니다.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="text-ink-500 rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="bg-danger flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          삭제하기
        </button>
      </div>
    </div>
  );
};
