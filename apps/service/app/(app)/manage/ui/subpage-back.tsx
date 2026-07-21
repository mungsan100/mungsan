import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

// 내 정보 하위 페이지 공통 뒤로가기 헤더(2026-07-21 IA 1차). 각 하위 섹션은 자체 제목을 렌더한다.
export function SubpageBack() {
  return (
    <header className="bg-canvas px-5 pt-12 pb-1">
      <Link
        href="/manage"
        className="text-ink-500 hover:text-ink-900 inline-flex items-center gap-1 text-sm font-semibold"
      >
        <LuChevronLeft className="h-4 w-4" /> 내 정보
      </Link>
    </header>
  );
}

export const SubpageSkeleton = () => (
  <div className="space-y-3 px-5">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-ink-100 h-24 animate-pulse rounded-2xl" />
    ))}
  </div>
);
