import { LuCompass } from 'react-icons/lu';

import { ScreenHeader } from '@/components/layout/screen-header';

import { partners } from './mock';
import { CollabSearchBar } from './ui/collab-search-bar';
import { PartnerCard } from './ui/partner-card';
import { RecommendLabel } from './ui/recommend-label';

// 협업 마켓플레이스 — AI 추천 파트너 기업 카드 리스트. UI 목 화면(RSC).
export default function CollabPage() {
  return (
    <>
      <ScreenHeader
        label="기회 탐색"
        labelIcon={<LuCompass className="h-4 w-4" />}
        title="협업 마켓플레이스"
        right={
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-semibold text-white">
            총 {partners.length}개 기업
          </span>
        }
      >
        <CollabSearchBar />
      </ScreenHeader>

      <div className="space-y-5 px-5 py-5">
        <div className="space-y-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-2.5">
          <RecommendLabel />
          <PartnerCard partner={partners[0]} />
        </div>
        {partners.slice(1).map((p) => (
          <PartnerCard key={p.id} partner={p} />
        ))}
      </div>
    </>
  );
}
