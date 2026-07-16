import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LuChevronLeft } from 'react-icons/lu';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getLoungeCommentsQuery } from './queries/lounge-comments.query';
import { getLoungePostDetailQuery } from './queries/lounge-post-detail.query';
import { CommentList } from './ui/comment-list';
import { PostDetail } from './ui/post-detail';

// 라운지 글 상세 — 밝은 헤더(뒤로) + 본문/반응 + 댓글 스레드. 조회는 Suspense 아래에서 수행.
export default function LoungePostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <header className="bg-canvas flex items-center gap-2 px-3 pt-12 pb-4">
        <Link
          href="/lounge"
          aria-label="라운지로 돌아가기"
          className="text-ink-700 flex h-9 w-9 items-center justify-center"
        >
          <LuChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-ink-900 text-lg font-bold">게시글</h1>
      </header>

      <Suspense fallback={<DetailSkeleton />}>
        <PostDetailSection params={params} />
      </Suspense>
    </>
  );
}

async function PostDetailSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const post = await getLoungePostDetailQuery({ postId: id, userId: user.id });
  if (!post) notFound();

  const comments = await getLoungeCommentsQuery({ postId: id });

  return (
    <div className="space-y-6 py-5">
      <PostDetail post={post} />
      <CommentList postId={post.id} comments={comments} totalCount={post.commentCount} />
    </div>
  );
}

const DetailSkeleton = () => (
  <div className="space-y-4 px-5 py-5">
    <div className="bg-ink-100 h-12 w-40 animate-pulse rounded-xl" />
    <div className="bg-ink-100 h-6 w-3/4 animate-pulse rounded" />
    <div className="bg-ink-100 h-28 animate-pulse rounded-2xl" />
  </div>
);
