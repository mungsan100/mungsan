'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { NOTIFICATION_TABS } from '../tabs';

// 알림 카테고리 탭 — URL(?tab=)로 표현해 서버가 필터한다. 활성 탭은 useSearchParams로 읽어
// 페이지 루트에서 searchParams를 await하지 않게 한다(cacheComponents 정적 셸 보호).
// · replace: 탭 전환을 히스토리에 쌓지 않는다 — 어느 탭에 있든 뒤로가기 한 번이면 알림 밖으로.
// · 칩은 항상 border를 가진다(활성은 배경색 border) — 활성/비활성 높이·폭이 어긋나지 않게.
export function NotificationTabs() {
  const params = useSearchParams();
  const active = params.get('tab') ?? 'all';

  return (
    <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5">
      {NOTIFICATION_TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            replace
            href={tab.key === 'all' ? '/notifications' : `/notifications?tab=${tab.key}`}
            className={cn(
              'inline-flex h-9 shrink-0 items-center justify-center rounded-full border px-3.5 text-[13px] leading-none font-semibold',
              isActive
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 text-ink-600 bg-white',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
