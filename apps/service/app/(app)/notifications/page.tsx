import { Suspense } from 'react';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import { BackHeader } from '../ui/back-header';
import { getUnreadNotificationCountQuery } from '../queries/home-notifications.query';
import { getNotificationsQuery } from './queries/notifications.query';
import { NOTIFICATION_TABS, type NotificationTab } from './tabs';
import { AutoMarkRead } from './ui/auto-mark-read';
import { MarkAllReadButton } from './ui/mark-all-read-button';
import { NotificationItem } from './ui/notification-item';
import { NotificationTabs } from './ui/notification-tabs';

// 알림 전용 페이지(IA 3차) — 벨 클릭의 목적지. 카테고리 탭 + 알림 목록(클릭 시 읽음+이동).
// 기존 알림 생성·읽음(markNotificationReadAction)·벨 카운트 로직을 그대로 재사용, 표시만 신설.
// 2026-07-22: 페이지 진입 시 현재 탭에 보이는 알림 자동 읽음(AutoMarkRead) + "모두 읽음" 버튼.
export default function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <>
      <BackHeader title="알림" />
      <main className="space-y-4 px-5 pt-2 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-ink-900 text-xl font-bold">알림</h1>
          {/* 미읽음이 있을 때만 서버가 렌더 — 정적 셸 보호를 위해 Suspense(무표시 폴백). */}
          <Suspense fallback={null}>
            <MarkAllReadSlot />
          </Suspense>
        </div>
        {/* useSearchParams 사용 — 정적 프리렌더 보호를 위해 Suspense로 감싼다. */}
        <Suspense fallback={<div className="h-9" />}>
          <NotificationTabs />
        </Suspense>
        <Suspense fallback={<NotificationSkeleton />}>
          <NotificationList searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function NotificationList({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const active: NotificationTab = NOTIFICATION_TABS.some((t) => t.key === tab)
    ? (tab as NotificationTab)
    : 'all';

  const user = await getCurrentUser();
  const notifications = await getNotificationsQuery(user.id, active);

  if (notifications.length === 0)
    return (
      <p className="text-ink-400 py-16 text-center text-sm">
        {active === 'all' ? '알림이 없습니다.' : '이 분류의 알림이 없습니다.'}
      </p>
    );

  // 화면에 나온 미읽음만 자동 읽음 대상 — 다른 탭의 미읽음은 그 탭에 들어가야 처리된다.
  const unreadIds = notifications.filter((n) => !n.readAt).map((n) => n.id);

  return (
    <div className="space-y-2.5">
      <AutoMarkRead ids={unreadIds} />
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}

// "모두 읽음" 버튼 슬롯 — 미읽음이 하나라도 있을 때만 버튼을 렌더한다(0건이면 아예 없음).
async function MarkAllReadSlot() {
  const user = await getCurrentUser();
  const unreadCount = await getUnreadNotificationCountQuery(user.id);
  if (unreadCount === 0) return null;
  return <MarkAllReadButton />;
}

const NotificationSkeleton = () => (
  <div className="space-y-2.5">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="bg-ink-100 h-20 animate-pulse rounded-2xl" />
    ))}
  </div>
);
