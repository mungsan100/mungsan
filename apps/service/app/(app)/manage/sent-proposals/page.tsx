import { Suspense } from 'react';

import { SentProposalSection } from '../ui/sent-proposal-section';
import { SubpageBack, SubpageSkeleton } from '../ui/subpage-back';

// 보낸 제안 전용 페이지(IA 1차) — 내 정보 허브에서 분리.
export default function SentProposalsPage() {
  return (
    <>
      <SubpageBack />
      <div className="pb-24">
        <Suspense fallback={<SubpageSkeleton />}>
          <SentProposalSection />
        </Suspense>
      </div>
    </>
  );
}
