import type { LoungeCommentView } from '../queries/lounge-comments.query';
import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';

interface CommentListProps {
  postId: string;
  comments: LoungeCommentView[];
  totalCount: number;
}

// 댓글 섹션 — 헤딩(총 개수) + 새 댓글 폼 + 스레드 리스트.
export const CommentList = ({ postId, comments, totalCount }: CommentListProps) => (
  <section className="px-5">
    <h2 className="text-ink-900 text-[15px] font-bold">댓글 {totalCount}</h2>

    <div className="mt-4">
      <CommentForm postId={postId} placeholder="댓글을 남겨보세요." />
    </div>

    {comments.length === 0 ? (
      <p className="text-ink-400 py-8 text-center text-sm">첫 댓글을 남겨보세요.</p>
    ) : (
      <ul className="mt-5 space-y-5">
        {comments.map((comment) => (
          <li key={comment.id}>
            <CommentItem postId={postId} comment={comment} />
          </li>
        ))}
      </ul>
    )}
  </section>
);
