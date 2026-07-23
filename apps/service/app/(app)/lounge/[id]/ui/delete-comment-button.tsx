'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle, LuTrash2 } from 'react-icons/lu';
import { toast } from 'sonner';

import { deleteLoungeCommentAction } from '@/app/(app)/lounge/commands/delete-lounge-comment.action';

interface DeleteCommentButtonProps {
  postId: string;
  commentId: string;
}

// 본인 댓글 삭제 버튼 + 인라인 확인 패널(DeleteContentButton 미러) — 본인 댓글에서만 렌더.
// 글과 달리 이동 없이 현재 상세를 refresh — 삭제 자리는 쿼리가 답글 유무로 알아서 처리한다.
export const DeleteCommentButton = ({ postId, commentId }: DeleteCommentButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await deleteLoungeCommentAction({ postId, commentId });
      if (!result.ok) {
        toast.error(result.message);
        setOpen(false);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-ink-400 hover:text-danger flex items-center gap-1 text-xs font-medium"
        aria-label="댓글 삭제"
      >
        <LuTrash2 className="h-3 w-3" />
        삭제
      </button>
    );

  return (
    <div className="border-ink-200 w-full space-y-3 rounded-xl border bg-white p-3 text-left">
      <div>
        <p className="text-ink-900 text-sm font-bold">이 댓글을 삭제하시겠어요?</p>
        <p className="text-ink-500 mt-0.5 text-xs">
          삭제하면 다시 볼 수 없습니다. 달린 답글은 남습니다.
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
