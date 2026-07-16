import type { ReactNode } from 'react';

// (auth) 그룹 — 회원가입/로그인/기업정보등록/가입심사중. (app)의 5탭 모바일 셸 없이
// 가운데 정렬된 단순 카드 레이아웃만 쓴다.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}
