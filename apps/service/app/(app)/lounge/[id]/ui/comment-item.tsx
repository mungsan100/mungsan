'use client';

import { useState } from 'react';
import { LuBadgeCheck } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { ReportButton } from '@/components/report-button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import type { LoungeCommentView } from '../queries/lounge-comments.query';
import { CommentForm } from './comment-form';
import { CommentLikeButton } from './comment-like-button';
import { DeleteCommentButton } from './delete-comment-button';

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
      <CommentBody postId={postId} comment={comment} />

      {/* 삭제 자리 댓글엔 답글·신고·삭제 액션을 모두 숨긴다(서버도 답글 작성을 거부). */}
      {!comment.isDeleted && (
        <div className="mt-1.5 ml-12 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setReplyOpen((v) => !v)}
            className="text-ink-400 text-xs font-medium"
          >
            답글 달기
          </button>
          {/* 본인 댓글이면 신고 대신 삭제 — 글 상세와 같은 배타 규칙. */}
          {comment.isMine ? (
            <DeleteCommentButton postId={postId} commentId={comment.id} />
          ) : (
            <ReportButton targetType="LOUNGE_COMMENT" targetId={comment.id} compact />
          )}
        </div>
      )}

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
              <CommentBody postId={postId} comment={reply} />
              {reply.isMine && (
                <div className="mt-1 flex justify-start">
                  <DeleteCommentButton postId={postId} commentId={reply.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 익명 게시판이라 아바타 없이 텍스트 메타만(2026-07-20 결정).
const CommentBody = ({ postId, comment }: { postId: string; comment: LoungeCommentView }) => {
  // 삭제 자리 — 작성자·내용을 노출하지 않고 답글 문맥만 지킨다.
  if (comment.isDeleted)
    return <p className="text-ink-400 text-sm leading-relaxed">삭제된 댓글입니다.</p>;

  return (
    <div className="flex items-start gap-3">
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
        <CommentLikeButton
          postId={postId}
          commentId={comment.id}
          liked={comment.liked}
          likeCount={comment.likeCount}
        />
      </div>
    </div>
  );
};
