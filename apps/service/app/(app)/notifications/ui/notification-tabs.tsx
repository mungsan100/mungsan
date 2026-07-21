'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { NOTIFICATION_TABS } from '../tabs';

// 알림 카테고리 탭 — URL(?tab=)로 표현해 서버가 필터한다. 활성 탭은 useSearchParams로 읽어
// 페이지 루트에서 searchParams를 await하지 않게 한다(cacheComponents 정적 셸 보호).
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
            href={tab.key === 'all' ? '/notifications' : `/notifications?tab=${tab.key}`}
            className={cn(
              'h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold',
              isActive ? 'bg-ink-900 text-white' : 'border-ink-200 text-ink-600 border bg-white',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
