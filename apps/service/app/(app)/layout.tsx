import { Suspense, type ReactNode } from 'react';

import { BottomTabBar, BottomTabBarFallback } from '@/components/layout/bottom-tab-bar';

// (app) 그룹 — 5탭 모바일 셸. 데스크톱에서도 가운데 정렬된 모바일 프레임으로 본다.
// 세션·기업등록·승인 상태 게이트는 middleware.ts가 HTTP 레벨에서 처리한다(레이아웃에서
// 직접 하면 cacheComponents의 정적 프리렌더링과 충돌한다 — 실측으로 확인됨).
// 각 화면은 자체 다크그린 헤더를 풀블리드로 렌더하므로 main에 가로 패딩을 두지 않는다.
// 하단 탭바(fixed)에 가리지 않도록 본문 하단 여백(pb)을 둔다.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col shadow-sm">
      <main className="flex-1 pb-20">{children}</main>
      <Suspense fallback={<BottomTabBarFallback />}>
        <BottomTabBar />
      </Suspense>
    </div>
  );
}
