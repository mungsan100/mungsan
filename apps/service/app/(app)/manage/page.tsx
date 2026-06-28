import { ScreenHeader } from '@/components/layout/screen-header';

import { assetReports, proposals, trustScore } from './mock';
import { AssetReportSection } from './ui/asset-report-section';
import { ProposalSection } from './ui/proposal-section';
import { TrustScoreCard } from './ui/trust-score-card';

// 비즈니스 관리 — 사용자 탭. Trust Score + 제안 관리 + 자산 리포트.
export default function ManagePage() {
  return (
    <>
      <ScreenHeader label="나의 비즈니스" title="비즈니스 관리">
        <TrustScoreCard data={trustScore} />
      </ScreenHeader>
      <div className="space-y-6 py-5">
        <ProposalSection proposals={proposals} />
        <AssetReportSection reports={assetReports} />
      </div>
    </>
  );
}
