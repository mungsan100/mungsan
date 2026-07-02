import { Suspense } from 'react';
import Link from 'next/link';
import { LuArrowLeft } from 'react-icons/lu';

import { CollabDetailContent } from './ui/collab-detail-content';

// 협업 공고 상세 — 밝은 헤더(뒤로) + 공고/회사 프로필 + 제안 폼. params(promise)를 Suspense 아래로.
export default function CollabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <header className="bg-canvas flex items-center gap-3 px-5 pt-12 pb-5">
        <Link href="/collab" aria-label="목록으로" className="text-ink-700">
          <LuArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-ink-900 text-lg font-bold">협업 상세</h1>
      </header>
      <div className="px-5 pb-5">
        <Suspense fallback={<DetailSkeleton />}>
          <CollabDetailContent params={params} />
        </Suspense>
      </div>
    </>
  );
}

const DetailSkeleton = () => (
  <div className="space-y-4">
    <div className="bg-ink-100 h-44 animate-pulse rounded-2xl" />
    <div className="bg-ink-100 h-56 animate-pulse rounded-2xl" />
  </div>
);
