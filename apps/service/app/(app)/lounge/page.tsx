import { LuCrown, LuUsersRound } from 'react-icons/lu';

import { ScreenHeader } from '@/components/layout/screen-header';

import { loungePosts } from './mock';
import { CategoryFilter } from './ui/category-filter';
import { PostCard } from './ui/post-card';
import { TrendCard } from './ui/trend-card';

// 라운지 — C-LEVEL 전용 커뮤니티 피드(필터 칩 · 실시간 트렌드 · 게시글 리스트).
export default function LoungePage() {
  return (
    <>
      <ScreenHeader
        label="C-LEVEL ONLY"
        labelIcon={<LuCrown className="h-3.5 w-3.5 text-amber-300" />}
        title="라운지"
        right={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white">
            <LuUsersRound className="h-4 w-4" />
            2,847명 활동 중
          </span>
        }
      />
      <div className="space-y-5 py-5">
        <section className="px-5">
          <CategoryFilter />
        </section>

        <section className="px-5">
          <TrendCard />
        </section>

        <section className="space-y-3 px-5">
          {loungePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </div>
    </>
  );
}
