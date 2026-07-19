import type { DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import {
  getHomeNotificationsQuery,
  type HomeNotification,
} from '../queries/home-notifications.query';
import {
  DecisionAlertCard,
  type DecisionAlert,
  type DecisionIcon,
  type DecisionTone,
} from './decision-alert-card';

// 알림 종류 → 아이콘·톤. 표시 매핑이라 소비처(ui) 로컬.
const ICON_TONE: Record<DB.NotificationType, { icon: DecisionIcon; tone: DecisionTone }> = {
  MEMBERSHIP: { icon: 'check', tone: 'success' },
  COLLABORATION: { icon: 'file', tone: 'warning' },
  PROJECT: { icon: 'trend', tone: 'warning' },
  LOUNGE: { icon: 'check', tone: 'success' },
  SYSTEM: { icon: 'file', tone: 'warning' },
};

// 의사결정 알림 섹션 — 내 알림을 조회해 알림 카드로 렌더.
export async function DecisionAlertSection() {
  const user = await getCurrentUser();
  const notifications = await getHomeNotificationsQuery(user.id);

  if (notifications.length === 0)
    return <p className="text-ink-400 text-sm">새로운 알림이 없습니다.</p>;

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <DecisionAlertCard key={n.id} alert={toAlert(n)} />
      ))}
    </div>
  );
}

// DB Notification → 알림 카드. 부제는 body(있으면) · 상대시각, linkUrl은 카드 링크로.
// id 는 클릭 시 읽음 처리(markNotificationReadAction) 대상.
function toAlert(n: HomeNotification): DecisionAlert {
  const { icon, tone } = ICON_TONE[n.type];
  const relative = formatRelativeKorean(n.createdAt);
  return {
    id: n.id,
    icon,
    tone,
    title: n.title,
    subtitle: n.body ? `${n.body} · ${relative}` : relative,
    href: n.linkUrl ?? undefined,
    unread: n.readAt == null,
  };
}
