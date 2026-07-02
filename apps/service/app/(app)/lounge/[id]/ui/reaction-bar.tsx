'use client';

import { useOptimistic, useTransition } from 'react';
import { LuBookmark, LuMessageCircle, LuThumbsUp } from 'react-icons/lu';

import { cn } from '@/lib/utils';

import { toggleLoungeBookmarkAction } from '../../commands/toggle-lounge-bookmark.action';
import { toggleLoungeLikeAction } from '../../commands/toggle-lounge-like.action';

interface ReactionBarProps {
  postId: string;
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
}

// 상세 반응 바 — 좋아요/북마크는 useOptimistic으로 즉시 반영하고, 액션의 revalidate가 서버 진실로 수렴시킨다.
export const ReactionBar = ({
  postId,
  liked,
  bookmarked,
  likeCount,
  commentCount,
  bookmarkCount,
}: ReactionBarProps) => {
  const [isPending, startTransition] = useTransition();

  const [likeState, applyLike] = useOptimistic(
    { liked, count: likeCount },
    (state: { liked: boolean; count: number }, delta: number) => ({
      liked: delta > 0,
      count: state.count + delta,
    }),
  );
  const [bookmarkState, applyBookmark] = useOptimistic(
    { bookmarked, count: bookmarkCount },
    (state: { bookmarked: boolean; count: number }, delta: number) => ({
      bookmarked: delta > 0,
      count: state.count + delta,
    }),
  );

  function onLike() {
    const delta = likeState.liked ? -1 : 1;
    startTransition(async () => {
      applyLike(delta);
      await toggleLoungeLikeAction({ postId });
    });
  }

  function onBookmark() {
    const delta = bookmarkState.bookmarked ? -1 : 1;
    startTransition(async () => {
      applyBookmark(delta);
      await toggleLoungeBookmarkAction({ postId });
    });
  }

  return (
    <div className="border-ink-100 mt-5 flex items-center border-t border-b py-1.5">
      <button
        type="button"
        onClick={onLike}
        disabled={isPending}
        className={cn(
          'flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60',
          likeState.liked ? 'text-brand' : 'text-ink-500',
        )}
      >
        <LuThumbsUp className={cn('h-[18px] w-[18px]', likeState.liked && 'fill-current')} />
        {likeState.count}
      </button>

      <span className="text-ink-500 flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-semibold">
        <LuMessageCircle className="h-[18px] w-[18px]" />
        {commentCount}
      </span>

      <button
        type="button"
        onClick={onBookmark}
        disabled={isPending}
        className={cn(
          'flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60',
          bookmarkState.bookmarked ? 'text-brand' : 'text-ink-500',
        )}
      >
        <LuBookmark className={cn('h-[18px] w-[18px]', bookmarkState.bookmarked && 'fill-current')} />
        {bookmarkState.count}
      </button>
    </div>
  );
};
