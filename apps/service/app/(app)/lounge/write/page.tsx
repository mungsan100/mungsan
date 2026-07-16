import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

import { WritePostForm } from './ui/write-post-form';

// 라운지 글쓰기 — 밝은 헤더(뒤로) + 작성 폼.
export default function LoungeWritePage() {
  return (
    <>
      <header className="bg-canvas flex items-center gap-2 px-3 pt-12 pb-4">
        <Link
          href="/lounge"
          aria-label="라운지로 돌아가기"
          className="text-ink-700 flex h-9 w-9 items-center justify-center"
        >
          <LuChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-ink-900 text-lg font-bold">글쓰기</h1>
      </header>

      <div className="px-5 py-5">
        <WritePostForm />
      </div>
    </>
  );
}
