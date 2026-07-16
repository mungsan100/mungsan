import { Suspense } from 'react';
import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

import { getCollabIndustriesQuery } from '../queries/collab-industries.query';
import { getCollabSkillsQuery } from '../queries/collab-skills.query';
import { WriteCollabPostForm } from './ui/write-collab-post-form';

// 협업 공고 작성 — 밝은 헤더(뒤로) + 업종·역량 카탈로그를 로드해 client 폼에 넘긴다.
export default function CollabWritePage() {
  return (
    <>
      <header className="bg-canvas flex items-center gap-2 px-3 pt-12 pb-4">
        <Link
          href="/collab"
          aria-label="협업 마켓플레이스로 돌아가기"
          className="text-ink-700 flex h-9 w-9 items-center justify-center"
        >
          <LuChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-ink-900 text-lg font-bold">협업 공고 작성</h1>
      </header>

      <div className="px-5 py-5">
        <Suspense fallback={<FormSkeleton />}>
          <WriteFormSection />
        </Suspense>
      </div>
    </>
  );
}

const WriteFormSection = async () => {
  const [industries, skills] = await Promise.all([
    getCollabIndustriesQuery(),
    getCollabSkillsQuery(),
  ]);
  return <WriteCollabPostForm industries={industries} skills={skills} />;
};

const FormSkeleton = () => (
  <div className="space-y-5">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <div className="bg-ink-100 h-4 w-20 animate-pulse rounded" />
        <div className="bg-ink-100 h-11 animate-pulse rounded-xl" />
      </div>
    ))}
  </div>
);
