import Link from 'next/link';
import { LuBell } from 'react-icons/lu';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getUnreadNotificationCountQuery } from '../queries/home-notifications.query';

// 공통 상단 유틸 바의 알림벨(서버) — 미읽음 수를 조회해 배지로. 클릭 시 홈 의사결정 알림으로.
// 클라 바(TopUtilityBar)의 bell 슬롯으로 주입돼 렌더된다(바 자체는 레이아웃 직속이라 하이드레이션됨).
export async function UtilityBell() {
  const user = await getCurrentUser();
  const unreadCount = await getUnreadNotificationCountQuery(user.id);

  return (
    <Link
      href="/#decision-alerts"
      aria-label="알림"
      className="text-ink-700 relative inline-flex h-10 w-10 items-center justify-center"
    >
      <LuBell className="h-[22px] w-[22px]" />
      {unreadCount > 0 && (
        <span className="ring-canvas absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
