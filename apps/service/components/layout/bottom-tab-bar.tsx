'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { LuLayoutGrid, LuUsersRound, LuRocket, LuLayers, LuShieldCheck } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────
// BottomTabBar — 5탭 모바일 하단 네비게이션.
// 중앙 "협업"은 셸 위로 떠오르는 그린 원형 버튼(raised).
// ──────────────────────────────────────────────────────

type Tab = {
  href: string;
  label: string;
  Icon: IconType;
  center?: boolean;
  match: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { href: '/', label: '홈', Icon: LuLayoutGrid, match: (p) => p === '/' },
  { href: '/lounge', label: '라운지', Icon: LuUsersRound, match: (p) => p.startsWith('/lounge') },
  { href: '/collab', label: '협업', Icon: LuRocket, center: true, match: (p) => p.startsWith('/collab') },
  { href: '/sherpa', label: 'My 셰르파', Icon: LuLayers, match: (p) => p.startsWith('/sherpa') },
  { href: '/manage', label: '관리', Icon: LuShieldCheck, match: (p) => p.startsWith('/manage') },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="border-ink-100 shadow-tab fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t bg-white/95 backdrop-blur">
      <div className="grid h-16 grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const { Icon } = tab;

          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-end pb-2"
              >
                <span className="from-brand to-brand-sub01 shadow-raised absolute -top-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b text-white ring-4 ring-white">
                  <Icon className="h-6 w-6" />
                </span>
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
          }

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
