'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LuBookmark } from 'react-icons/lu';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { toggleCollabBookmarkAction } from '../../commands/toggle-collab-bookmark.action';

interface DetailBookmarkButtonProps {
  postId: string;
  initialBookmarked: boolean;
}

export const DetailBookmarkButton = ({ postId, initialBookmarked }: DetailBookmarkButtonProps) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const res = await toggleCollabBookmarkAction({ postId });
      if (res.ok) {
        setBookmarked(res.data.bookmarked);
        router.refresh(); // 화면의 '저장 N' 서버 카운트도 즉시 갱신
      } else toast.error(res.message);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? '저장 해제' : '공고 저장'}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:opacity-50',
        bookmarked ? 'border-brand bg-brand-soft text-brand' : 'border-ink-200 text-ink-400 bg-white',
      )}
    >
      <LuBookmark className={cn('h-5 w-5', bookmarked && 'fill-current')} />
    </button>
  );
};
