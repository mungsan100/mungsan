import { Suspense } from 'react';

import { MyPostsSection } from '../ui/my-posts-section';
import { SubpageBack, SubpageSkeleton } from '../ui/subpage-back';

// 내가 쓴 글 전용 페이지(IA 1차) — 내 정보 허브에서 분리.
export default function MyPostsPage() {
  return (
    <>
      <SubpageBack />
      <div className="pb-24">
        <Suspense fallback={<SubpageSkeleton />}>
          <MyPostsSection />
        </Suspense>
      </div>
    </>
  );
}
