import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

import { BottomTabBar, BottomTabBarFallback } from '@/components/layout/bottom-tab-bar';
import { getSession } from '@/lib/auth/session';

// (app) 그룹 — 5탭 모바일 셸. 데스크톱에서도 가운데 정렬된 모바일 프레임으로 본다.
// 각 화면은 자체 다크그린 헤더를 풀블리드로 렌더하므로 main에 가로 패딩을 두지 않는다.
// 하단 탭바(fixed)에 가리지 않도록 본문 하단 여백(pb)을 둔다.
//
// AppLayout 자체는 동적 데이터를 읽지 않는 정적 셸이다 — 세션 조회(동적)는 AuthGate로 분리해
// Suspense로 감싼다. 그래야 cacheComponents가 이 셸을 정적으로 프리렌더하고, 동적 게이트만
// 스트리밍할 수 있다(레이아웃에서 직접 await 하면 하위 전체 라우트의 정적 프리렌더가 깨진다).
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col shadow-sm">
      <main className="flex-1 pb-20">
        <Suspense fallback={<AuthGateFallback />}>
          <AuthGate>{children}</AuthGate>
        </Suspense>
      </main>
      <Suspense fallback={<BottomTabBarFallback />}>
        <BottomTabBar />
      </Suspense>
    </div>
  );
}

// 진입 전 세션·기업등록·승인 상태를 확인해 미충족 시 각 단계로 되돌린다
// (로그인 → 기업정보등록 → 가입심사중).
async function AuthGate({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!session.company) redirect('/company');
  if (!session.approvedAt || session.suspendedAt) redirect('/pending');

  return <>{children}</>;
}

function AuthGateFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-hidden>
      <LuLoaderCircle className="text-ink-300 h-6 w-6 animate-spin" />
    </div>
  );
}
