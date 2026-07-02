'use client';

import { useState } from 'react';
import { LuBadgeCheck } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import type { LoungeCommentView } from '../queries/lounge-comments.query';
import { CommentForm } from './comment-form';

// 임원 직책 → 표시 라벨. 표시 매핑이라 소비처(ui) 로컬.
const ROLE_LABELS: Record<DB.ExecutiveRole, string> = {
  CEO: 'CEO',
  COO: 'COO',
  CTO: 'CTO',
  CFO: 'CFO',
  CMO: 'CMO',
  CISO: 'CISO',
  CPO: 'CPO',
  FOUNDER: '창업자',
  CHAIRMAN: '회장',
  OTHER: '임원',
};

interface CommentItemProps {
  postId: string;
  comment: LoungeCommentView;
}

// 최상위 댓글 + 답글 폼 토글 + 직속 답글 목록(2단 스레드).
export const CommentItem = ({ postId, comment }: CommentItemProps) => {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div>
      <CommentBody comment={comment} />

      <button
        type="button"
        onClick={() => setReplyOpen((v) => !v)}
        className="text-ink-400 mt-1.5 ml-12 text-xs font-medium"
      >
        답글 달기
      </button>

      {replyOpen && (
        <div className="mt-2 ml-12">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            placeholder="답글을 입력해 주세요."
            onDone={() => setReplyOpen(false)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <ul className="border-ink-100 mt-3 ml-12 space-y-3 border-l pl-3">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentBody comment={reply} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CommentBody = ({ comment }: { comment: LoungeCommentView }) => (
  <div className="flex items-start gap-3">
    <Avatar
      fallback={[...comment.nickname][0] ?? ''}
      className="bg-brand-soft text-brand-sub02 h-9 w-9 text-sm"
    />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-ink-900 truncate text-sm font-bold">{comment.nickname}</span>
        {comment.verified && <LuBadgeCheck className="text-brand h-3.5 w-3.5 shrink-0" />}
        <Badge variant="secondary" size="sm">
          {comment.executiveRole === 'OTHER'
            ? (comment.jobTitle ?? ROLE_LABELS.OTHER)
            : ROLE_LABELS[comment.executiveRole]}
        </Badge>
        <span className="text-ink-400 text-xs">{formatRelativeKorean(comment.createdAt)}</span>
      </div>
      <p className="text-ink-700 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>
    </div>
  </div>
);
