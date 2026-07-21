import { Suspense } from 'react';

import { SavedSection } from '../ui/saved-section';
import { SubpageBack, SubpageSkeleton } from '../ui/subpage-back';

// 저장한 글 전용 페이지(IA 1차) — 내 정보 허브에서 분리.
export default function SavedPage() {
  return (
    <>
      <SubpageBack />
      <div className="pb-24">
        <Suspense fallback={<SubpageSkeleton />}>
          <SavedSection />
        </Suspense>
      </div>
    </>
  );
}
