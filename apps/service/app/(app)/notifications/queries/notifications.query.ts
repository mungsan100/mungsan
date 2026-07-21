import 'server-only';

import { prisma } from '@mungsan/db';

import type { NotificationRow, NotificationTab } from '../tabs';

// 알림 전용 페이지(IA 3차, 2026-07-22) — 카테고리 탭별 알림 목록.
// 기존 Notification(type·linkUrl)만으로 분류한다(스키마 무변경):
//   · 댓글·제안 = LOUNGE(댓글·대댓글) + COLLABORATION(제안 수신·응답) + PROJECT
//   · 지원사업  = SYSTEM 이면서 linkUrl 이 /support (맞춤 공고 요약)
//   · 공지      = SYSTEM 이면서 그 외(운영 공지 fan-out)
//   · 전체      = 위 + 가입 승인/반려(MEMBERSHIP) 포함 모두

// 탭 → 추가 where 절(userId 와 AND). 전체는 조건 없음.
function tabWhere(tab: NotificationTab): object {
  switch (tab) {
    case 'activity':
      return { type: { in: ['LOUNGE', 'COLLABORATION', 'PROJECT'] } };
    case 'support':
      return { type: 'SYSTEM', linkUrl: { startsWith: '/support' } };
    case 'notice':
      return { type: 'SYSTEM', NOT: { linkUrl: { startsWith: '/support' } } };
    case 'all':
    default:
      return {};
  }
}

export async function getNotificationsQuery(
  userId: string,
  tab: NotificationTab,
): Promise<NotificationRow[]> {
  return prisma.notification.findMany({
    where: { userId, ...tabWhere(tab) },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      linkUrl: true,
      createdAt: true,
      readAt: true,
    },
  });
}
