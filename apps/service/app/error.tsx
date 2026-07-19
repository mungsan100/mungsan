'use client';

import Link from 'next/link';
import { LuRotateCcw, LuTriangleAlert } from 'react-icons/lu';

// 커스텀 에러 화면 — 렌더 중 잡히지 않은 예외의 세그먼트 경계(오픈 전 기본기).
// reset()은 에러 경계를 다시 렌더해 일시 오류(네트워크 순단 등)를 복구한다.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-canvas flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <div className="bg-ink-100 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
          <LuTriangleAlert className="text-ink-500 h-8 w-8" />
        </div>
        <h1 className="text-ink-900 mt-6 text-xl font-bold">일시적인 문제가 발생했어요</h1>
        <p className="text-ink-500 mt-2 text-sm leading-relaxed">
          잠시 후 다시 시도해 주세요.
          <br />
          문제가 계속되면 운영팀에 알려주시면 빠르게 확인할게요.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-brand hover:bg-brand-sub01 mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-colors"
        >
          <LuRotateCcw className="h-4 w-4" />
          다시 시도
        </button>
        <Link
          href="/"
          className="text-ink-500 hover:text-ink-900 mt-3 inline-block w-full py-2 text-sm font-semibold"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
