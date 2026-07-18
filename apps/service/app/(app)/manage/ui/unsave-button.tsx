'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle, LuX } from 'react-icons/lu';
import { toast } from 'sonner';

import { removeSavedItemAction } from '../commands/remove-saved-item.action';

// 저장 취소 버튼 — 저장 목록 행 우측. 성공 시 refresh로 행이 목록에서 사라진다.
export const UnsaveButton = ({
  target,
  postId,
}: {
  target: 'LOUNGE' | 'COLLAB';
  postId: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await removeSavedItemAction({ target, postId });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      aria-label="저장 취소"
      title="저장 취소"
      onClick={remove}
      disabled={isPending}
      className="text-ink-300 hover:text-ink-600 hover:bg-ink-100 shrink-0 rounded-full p-2 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <LuLoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <LuX className="h-4 w-4" />
      )}
    </button>
  );
};
