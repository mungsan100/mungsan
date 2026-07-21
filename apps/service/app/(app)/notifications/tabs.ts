import type { DB } from '@mungsan/db';

// 알림 카테고리 탭·행 타입 — 서버(쿼리·페이지)와 클라(탭)가 함께 쓰는 순수 상수/타입.
// prisma 등 서버 전용 의존을 두지 않는다(클라 번들에 노드 모듈이 딸려오지 않게 분리).
export const NOTIFICATION_TABS = [
  { key: 'all', label: '전체' },
  { key: 'activity', label: '댓글·제안' },
  { key: 'support', label: '지원사업' },
  { key: 'notice', label: '공지' },
] as const;
export type NotificationTab = (typeof NOTIFICATION_TABS)[number]['key'];

export type NotificationRow = {
  id: string;
  type: DB.NotificationType;
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdAt: Date;
  readAt: Date | null;
};
