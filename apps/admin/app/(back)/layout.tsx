import { Suspense } from 'react';
import Link from 'next/link';

import { logoutAction } from './approvals/commands/logout.action';
import { BackNav } from './ui/back-nav';

// 운영 화면 공통 셸 — 상단 헤더(타이틀 + 메뉴 탭 + 로그아웃). 접근 차단은 proxy.ts(HTTP 레벨)가 담당.
// BackNav(usePathname)는 cacheComponents 프리렌더에서 동적 취급이라 Suspense 로 감싼다 —
// 안 감싸면 "Uncached data was accessed outside of <Suspense>" 로 라우트 전체가 막힌다(실측).
export default function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 pb-16">
      <header className="flex items-center justify-between border-b border-slate-200 py-5">
        <div className="flex items-center gap-6">
          <Link href="/approvals" className="text-lg font-bold text-slate-900">
            뭉산 운영 백오피스
          </Link>
          <Suspense fallback={<div className="h-8 w-44" aria-hidden />}>
            <BackNav />
          </Suspense>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            로그아웃
          </button>
        </form>
      </header>
      <div className="py-8">{children}</div>
    </div>
  );
}
