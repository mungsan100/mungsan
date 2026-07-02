import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getUnreadNotificationCountQuery } from '../queries/home-notifications.query';
import { NotificationBell } from './notification-bell';

// 헤더 알림벨 — 미읽음 알림 수 실수치.
export async function NotificationBellCount() {
  const user = await getCurrentUser();
  const count = await getUnreadNotificationCountQuery(user.id);
  return <NotificationBell count={count} />;
}
