'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { LuLayoutGrid, LuUsersRound, LuRocket, LuLayers, LuShieldCheck } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────
// BottomTabBar — 5탭 모바일 하단 네비게이션. 모든 탭 동일한 flat 스타일(가운데 raised 없음).
// ──────────────────────────────────────────────────────

type Tab = {
  href: string;
  label: string;
  Icon: IconType;
  match: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { href: '/', label: '홈', Icon: LuLayoutGrid, match: (p) => p === '/' },
  { href: '/lounge', label: '라운지', Icon: LuUsersRound, match: (p) => p.startsWith('/lounge') },
  { href: '/collab', label: '협업', Icon: LuRocket, match: (p) => p.startsWith('/collab') },
  { href: '/sherpa', label: 'My 셰르파', Icon: LuLayers, match: (p) => p.startsWith('/sherpa') },
  { href: '/manage', label: '관리', Icon: LuShieldCheck, match: (p) => p.startsWith('/manage') },
];

const NAV_CLASS =
  'border-ink-100 shadow-tab fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t bg-white/95 backdrop-blur';

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className={NAV_CLASS}>
      <div className="grid h-16 grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const { Icon } = tab;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1"
            >
              <Icon className={cn('h-[22px] w-[22px]', active ? 'text-brand' : 'text-ink-400')} />
              <span
                className={cn(
                  'text-[11px]',
                  active ? 'text-brand font-semibold' : 'text-ink-400 font-medium',
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// 정적 프리렌더용 폴백 — usePathname 없이 동일한 바 크롬(활성표시 없음). cacheComponents에서
// BottomTabBar를 Suspense로 감쌀 때 레이아웃 시프트 없이 셸을 채운다. hydration 후 실제 바로 교체.
export function BottomTabBarFallback() {
  return (
    <nav className={NAV_CLASS} aria-hidden>
      <div className="grid h-16 grid-cols-5">
        {TABS.map((tab) => {
          const { Icon } = tab;
          return (
            <span key={tab.href} className="flex flex-col items-center justify-center gap-1">
              <Icon className="text-ink-400 h-[22px] w-[22px]" />
              <span className="text-ink-400 text-[11px] font-medium">{tab.label}</span>
            </span>
          );
        })}
      </div>
    </nav>
  );
}
