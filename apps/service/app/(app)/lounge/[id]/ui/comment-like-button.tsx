'use client';

import { useOptimistic, useTransition } from 'react';
import { LuThumbsUp } from 'react-icons/lu';

import { cn } from '@/lib/utils';

import { toggleLoungeCommentLikeAction } from '../../commands/toggle-lounge-comment-like.action';

interface CommentLikeButtonProps {
  postId: string;
  commentId: string;
  liked: boolean;
  likeCount: number;
}

// 댓글 좋아요 — reaction-bar.tsx와 동일한 useOptimistic 즉시반영 패턴.
export const CommentLikeButton = ({ postId, commentId, liked, likeCount }: CommentLikeButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [state, applyLike] = useOptimistic(
    { liked, count: likeCount },
    (s: { liked: boolean; count: number }, delta: number) => ({
      liked: delta > 0,
      count: s.count + delta,
    }),
  );

  function onLike() {
    const delta = state.liked ? -1 : 1;
    startTransition(async () => {
      applyLike(delta);
      await toggleLoungeCommentLikeAction({ commentId, postId });
    });
  }

  return (
    <button
      type="button"
      onClick={onLike}
      disabled={isPending}
      className={cn(
        'mt-1.5 flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-60',
        state.liked ? 'text-brand' : 'text-ink-400',
      )}
    >
      <LuThumbsUp className={cn('h-3.5 w-3.5', state.liked && 'fill-current')} />
      {state.count > 0 && state.count}
    </button>
  );
};
