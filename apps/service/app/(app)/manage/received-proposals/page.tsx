import { Suspense } from 'react';

import { ProposalSection } from '../ui/proposal-section';
import { SubpageBack, SubpageSkeleton } from '../ui/subpage-back';

// 받은 제안 전용 페이지(IA 1차) — 내 정보 허브에서 분리.
export default function ReceivedProposalsPage() {
  return (
    <>
      <SubpageBack />
      <div className="pb-24">
        <Suspense fallback={<SubpageSkeleton />}>
          <ProposalSection />
        </Suspense>
      </div>
    </>
  );
}
