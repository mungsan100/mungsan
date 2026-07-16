import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

import { BottomTabBar, BottomTabBarFallback } from '@/components/layout/bottom-tab-bar';
import { getSession } from '@/lib/auth/session';

// (app) 그룹 — 5탭 모바일 셸. 진입 전 세션·기업등록·승인 상태를 확인해 미충족 시
// 각 단계로 되돌린다(로그인 → 기업정보등록 → 가입심사중). 데스크톱에서도 가운데 정렬된
// 모바일 프레임으로 본다. 각 화면은 자체 다크그린 헤더를 풀블리드로 렌더하므로 main에
// 가로 패딩을 두지 않는다. 하단 탭바(fixed)에 가리지 않도록 본문 하단 여백(pb)을 둔다.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!session.company) redirect('/company');
  if (!session.approvedAt || session.suspendedAt) redirect('/pending');

  return (
    <div className="bg-canvas relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col shadow-sm">
      <main className="flex-1 pb-20">{children}</main>
      <Suspense fallback={<BottomTabBarFallback />}>
        <BottomTabBar />
      </Suspense>
    </div>
  );
}
