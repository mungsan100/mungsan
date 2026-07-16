import Link from 'next/link';
import {
  LuBadgeCheck,
  LuBookmark,
  LuFlame,
  LuMessageCircle,
  LuThumbsUp,
} from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import type { LoungeFeedPost } from '../queries/lounge-feed.query';
import { LOUNGE_CATEGORY_LABELS } from './lounge-category';

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

interface PostCardProps {
  post: LoungeFeedPost;
}

// 라운지 게시글 카드 — 카드 전체가 상세로 향하는 링크. 작성자 메타행 + 제목 + 미리보기 +
// 하단(카테고리 태그 · 반응 카운트).
export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link href={`/lounge/${post.id}`} className="block">
      <Card className="p-4">
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
          {post.hot && (
            <Badge size="sm" className="shrink-0 bg-orange-50 text-orange-500">
              <LuFlame className="h-3 w-3" />
              HOT
            </Badge>
          )}
        </div>

        <h3 className="text-ink-900 mt-3 text-base leading-snug font-bold">{post.title}</h3>

        <p className="text-ink-500 mt-1.5 line-clamp-2 text-sm leading-relaxed">{post.content}</p>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="bg-brand-soft text-brand-sub02 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {LOUNGE_CATEGORY_LABELS[post.category]}
          </span>
          <div className="text-ink-500 flex items-center gap-4 text-[13px]">
            <span className="flex items-center gap-1">
              <LuThumbsUp className="h-4 w-4" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <LuMessageCircle className="h-4 w-4" />
              {post.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <LuBookmark className="h-4 w-4" />
              {post.bookmarkCount}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
