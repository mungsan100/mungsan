import Link from 'next/link';

import { logoutAction } from './commands/logout.action';

// 운영 화면 공통 셸 — 상단 헤더(타이틀 + 로그아웃). 접근 차단은 proxy.ts(HTTP 레벨)가 담당.
export default function ApprovalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 pb-16">
      <header className="flex items-center justify-between border-b border-slate-200 py-5">
        <Link href="/approvals" className="text-lg font-bold text-slate-900">
          뭉산 운영 백오피스
        </Link>
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
