import { Suspense, type ReactNode } from 'react';

import { BottomTabBar, BottomTabBarFallback } from '@/components/layout/bottom-tab-bar';

import { TopUtilityBar } from './ui/top-utility-bar';
import { UtilityBell } from './ui/utility-bell';

// (app) 그룹 — 5탭 모바일 셸. 데스크톱에서도 가운데 정렬된 모바일 프레임으로 본다.
// 세션·기업등록·승인 상태 게이트는 middleware.ts가 HTTP 레벨에서 처리한다(레이아웃에서
// 직접 하면 cacheComponents의 정적 프리렌더링과 충돌한다 — 실측으로 확인됨).
// 각 화면은 자체 다크그린 헤더를 풀블리드로 렌더하므로 main에 가로 패딩을 두지 않는다.
// 하단 탭바(fixed)에 가리지 않도록 본문 하단 여백(pb)을 둔다.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col shadow-sm">
      {/* 모든 탭 우측 상단 공통 🔔·☰(IA 2차) — 바는 레이아웃 직속 클라(하이드레이션),
          미읽음 수 벨은 서버에서 렌더해 bell 슬롯으로 주입(홈 헤더 bell 슬롯과 동일 사상). */}
      <TopUtilityBar
        bell={
          <Suspense fallback={<span className="inline-flex h-10 w-10" />}>
            <UtilityBell />
          </Suspense>
        }
      />
      <main className="flex-1 pb-20">{children}</main>
      <Suspense fallback={<BottomTabBarFallback />}>
        <BottomTabBar />
      </Suspense>
    </div>
  );
}
