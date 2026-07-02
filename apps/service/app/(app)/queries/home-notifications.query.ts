import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

export type HomeNotification = {
  id: string;
  type: DB.NotificationType;
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdAt: Date;
  readAt: Date | null;
};

export async function getHomeNotificationsQuery(userId: string): Promise<HomeNotification[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
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

export async function getUnreadNotificationCountQuery(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}
