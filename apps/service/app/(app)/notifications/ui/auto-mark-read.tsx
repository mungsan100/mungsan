'use client';

import { useEffect, useRef } from 'react';

import { markNotificationsReadBulkAction } from '@/app/(app)/commands/mark-notifications-read-bulk.action';

// 알림 페이지 자동 읽음(2026-07-22) — 서버가 렌더한 현재 탭의 미읽음 id 목록을 받아
// 마운트 시 한 번 일괄 읽음 처리한다. 성공하면 layout revalidate 로 벨 배지가 사라지고
// 목록도 읽음 스타일로 갱신된다(그 갱신에서 ids 가 빈 배열이 되므로 재호출 없음).
// 같은 id 집합으로 중복 발화하지 않도록 ref 로 직전 처리 집합을 기억한다.
export const AutoMarkRead = ({ ids }: { ids: string[] }) => {
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;
    const key = [...ids].sort().join(',');
    if (firedFor.current === key) return;
    firedFor.current = key;
    // 실패해도 다음 진입에서 다시 시도되는 성격이라 조용히 무시한다(알림 UX 를 막지 않는다).
    void markNotificationsReadBulkAction({ notificationIds: ids }).catch(() => {});
  }, [ids]);

  return null;
};
