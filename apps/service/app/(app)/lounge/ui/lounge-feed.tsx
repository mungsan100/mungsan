import { getLoungeFeedQuery } from '../queries/lounge-feed.query';
import { PostCard } from './post-card';

// 라운지 최신 글 리스트 — searchParams(promise)를 여기서 await(cacheComponents 정적 셸 보호)해
// 산업 필터를 파싱하고 필터한 게시글을 렌더한다.
export async function LoungeFeed({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const { industry } = await searchParams;
  const posts = await getLoungeFeedQuery({ industry: industry?.trim() || undefined });

  if (posts.length === 0)
    return (
      <p className="text-ink-400 py-10 text-center text-sm">아직 등록된 게시글이 없습니다.</p>
    );

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
