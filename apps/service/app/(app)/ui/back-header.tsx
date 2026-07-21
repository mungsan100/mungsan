'use client';

import { useRouter } from 'next/navigation';
import { LuChevronLeft } from 'react-icons/lu';

// 더보기(설정·문의·공지·도움말)에서 진입한 유틸 페이지의 뒤로가기 헤더 — 직전 화면으로 복귀.
export function BackHeader({ title }: { title?: string }) {
  const router = useRouter();
  return (
    <header className="bg-canvas flex items-center gap-1 px-3 pt-12 pb-1">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로"
        className="text-ink-500 hover:text-ink-900 flex items-center gap-1 px-2 py-1 text-sm font-semibold"
      >
        <LuChevronLeft className="h-5 w-5" />
        {title ?? '뒤로'}
      </button>
    </header>
  );
}
