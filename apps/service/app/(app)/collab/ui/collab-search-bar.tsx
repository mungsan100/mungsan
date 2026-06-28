import { LuSearch, LuSlidersHorizontal } from 'react-icons/lu';

// 헤더 하단 검색바 — 흰 입력 필드 + 그린 필터 버튼. 비기능 목(정적).
export const CollabSearchBar = () => (
  <div className="mt-4 flex items-center gap-2">
    <div className="flex h-12 flex-1 items-center gap-2.5 rounded-xl bg-white px-4 shadow-sm">
      <LuSearch className="text-ink-400 h-[18px] w-[18px] shrink-0" />
      <span className="text-ink-400 text-[15px]">기업명, 기술, 키워드 검색</span>
    </div>
    <button
      type="button"
      aria-label="검색 필터"
      className="bg-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
    >
      <LuSlidersHorizontal className="h-5 w-5" />
    </button>
  </div>
);
