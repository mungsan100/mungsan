import { LuBadgeCheck } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { LOUNGE_CATEGORY_LABELS } from '../../ui/lounge-category';
import type { LoungePostDetail } from '../queries/lounge-post-detail.query';
import { ReactionBar } from './reaction-bar';

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

interface PostDetailProps {
  post: LoungePostDetail;
}

// 글 상세 본문 — 작성자 메타 + 카테고리 태그 + 제목 + 본문 + 반응 바.
export const PostDetail = ({ post }: PostDetailProps) => (
  <article className="px-5">
    <div className="flex items-start gap-3">
      <Avatar fallback={[...post.nickname][0] ?? ''} className="bg-brand text-white" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-ink-900 truncate text-[15px] font-bold">{post.nickname}</span>
          {post.verified && <LuBadgeCheck className="text-brand h-4 w-4 shrink-0" />}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="default" size="sm">
            {post.executiveRole === 'OTHER'
              ? (post.jobTitle ?? ROLE_LABELS.OTHER)
              : ROLE_LABELS[post.executiveRole]}
          </Badge>
          {post.industryName && (
            <span className="bg-ink-100 text-ink-500 rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
              {post.industryName}
            </span>
          )}
          <span className="text-ink-400 text-xs">{formatRelativeKorean(post.createdAt)}</span>
        </div>
      </div>
    </div>

    <span className="bg-brand-soft text-brand-sub02 mt-4 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold">
      {LOUNGE_CATEGORY_LABELS[post.category]}
    </span>
    <h1 className="text-ink-900 mt-2 text-xl leading-snug font-bold">{post.title}</h1>
    <p className="text-ink-700 mt-3 text-[15px] leading-relaxed whitespace-pre-wrap">
      {post.content}
    </p>

    <ReactionBar
      postId={post.id}
      liked={post.liked}
      bookmarked={post.bookmarked}
      likeCount={post.likeCount}
      commentCount={post.commentCount}
      bookmarkCount={post.bookmarkCount}
    />
  </article>
);
