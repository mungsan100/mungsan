'use client';

import { useEffect, useRef } from 'react';

import { incrementCollabViewAction } from '../../commands/increment-collab-view.action';

// 조회수 트래킹 — 마운트 시 1회 조회수 증가를 command로 트리거한다(RSC→command 금지라 client가 정석).
// StrictMode 개발 이중 마운트 방지를 위해 ref로 1회만 호출. 렌더 출력은 없다.
interface ViewCounterProps {
  postId: string;
}

export const ViewCounter = ({ postId }: ViewCounterProps) => {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    void incrementCollabViewAction({ postId });
  }, [postId]);

  return null;
};
