import { LuBadgeCheck } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { DeleteContentButton } from '@/components/delete-content-button';
import { ReportButton } from '@/components/report-button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import type { LoungePostDetail } from '../queries/lounge-post-detail.query';
import { CategoryEditor } from './category-editor';
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
    {/* 운영 숨김 글 — 이 화면은 작성자 본인에게만 열린다(타인은 쿼리에서 차단). */}
    {post.hiddenForOthers && (
      <div className="bg-ink-100 mb-4 rounded-xl px-4 py-3">
        <p className="text-ink-700 text-sm font-semibold">
          운영정책 위반으로 숨김 처리된 글입니다.
        </p>
        <p className="text-ink-500 mt-0.5 text-xs">
          이 글은 작성자인 회원님에게만 보이며, 다른 회원에게는 노출되지 않습니다. 문의는
          운영팀으로 부탁드립니다.
        </p>
      </div>
    )}
    {/* 익명 게시판이라 아바타 없이 텍스트 메타만(2026-07-20 결정). */}
    <div className="flex items-start gap-3">
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

    {/* 카테고리 — AI 자동 분류(5-3). 작성자 본인은 여기서 바로 수정할 수 있다. */}
    <div className="mt-4">
      <CategoryEditor postId={post.id} category={post.category} editable={post.isOwnPost} />
    </div>
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

    {/* 본인 글이면 삭제, 타인 글이면 신고 — 신고는 타인 콘텐츠 대상이라 서로 배타. */}
    <div className="mt-3 flex justify-end">
      {post.isOwnPost ? (
        <DeleteContentButton target="LOUNGE_POST" postId={post.id} />
      ) : (
        <ReportButton targetType="LOUNGE_POST" targetId={post.id} />
      )}
    </div>
  </article>
);
