import { LuTrophy } from 'react-icons/lu';

// "AI 추천 최우선 파트너" 작은 섹션 라벨 — 보더 알약 + 골드 트로피 아이콘.
export const RecommendLabel = () => (
  <div className="border-ink-200 inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 shadow-sm">
    <LuTrophy className="h-3.5 w-3.5 text-amber-500" />
    <span className="text-ink-900 text-[13px] font-bold">AI 추천 최우선 파트너</span>
  </div>
);
