import {
  LuBadgeCheck,
  LuBookmark,
  LuChevronRight,
  LuEllipsis,
  LuFlame,
  LuMessageCircle,
  LuThumbsUp,
} from 'react-icons/lu';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import type { LoungePost } from '../mock';

interface PostCardProps {
  post: LoungePost;
}

// 라운지 게시글 카드 — 작성자 메타행 + 해시태그 + 제목 + 미리보기 + 반응 푸터.
export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar fallback={post.authorInitial} className="bg-brand text-white" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-ink-900 truncate text-[15px] font-bold">{post.authorName}</span>
            {post.verified && <LuBadgeCheck className="text-brand h-4 w-4 shrink-0" />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="bg-ink-100 text-ink-500 rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
              {post.revenue}
            </span>
            <Badge variant="default" size="sm">
              {post.role}
            </Badge>
            <span className="text-ink-400 text-xs">{post.postedAt}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {post.hot && (
            <Badge size="sm" className="bg-orange-50 text-orange-500">
              <LuFlame className="h-3 w-3" />
              HOT
            </Badge>
          )}
          <button type="button" className="text-ink-400" aria-label="더보기">
            <LuEllipsis className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="text-brand mt-3 text-[13px] font-semibold">#{post.category}</div>

      <h3 className="text-ink-900 mt-1.5 text-base leading-snug font-bold">{post.title}</h3>

      <p className="text-ink-500 mt-1.5 line-clamp-2 text-sm leading-relaxed">{post.preview}</p>

      <div className="mt-3.5 flex items-center justify-between">
        <div className="text-ink-500 flex items-center gap-4 text-[13px]">
          <span className="flex items-center gap-1">
            <LuThumbsUp className="h-4 w-4" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <LuMessageCircle className="h-4 w-4" />
            {post.comments}
          </span>
          <span className="flex items-center gap-1">
            <LuBookmark className="h-4 w-4" />
            {post.bookmarks}
          </span>
        </div>
        <button
          type="button"
          className="text-ink-500 flex items-center gap-0.5 text-[13px] font-medium"
        >
          답글 달기
          <LuChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
};
