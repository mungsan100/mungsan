'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuChevronRight,
  LuCircleCheck,
  LuFileText,
  LuTrendingUp,
} from 'react-icons/lu';

import { markNotificationReadAction } from '../commands/mark-notification-read.action';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type DecisionIcon = 'file' | 'trend' | 'check';
export type DecisionTone = 'warning' | 'success';

export type DecisionAlert = {
  id: string; // Notification.id — 클릭 시 읽음 처리 대상
  icon: DecisionIcon;
  tone: DecisionTone;
  title: string;
  subtitle: string;
  href?: string;
  unread?: boolean; // 아직 읽지 않은 알림이면 제목 옆에 표식
};

const ICONS: Record<DecisionIcon, React.ComponentType<{ className?: string }>> = {
  file: LuFileText,
  trend: LuTrendingUp,
  check: LuCircleCheck,
};

const TONE: Record<DecisionTone, string> = {
  warning: 'bg-amber-50 text-amber-500',
  success: 'bg-emerald-50 text-emerald-600',
};

interface DecisionAlertCardProps {
  alert: DecisionAlert;
}

// 의사결정 알림 카드 — 타입 아이콘(톤) + 제목/부제. 클릭하면 읽음 처리 후 linkUrl 로 이동한다
// (벨 미확인 카운트도 그만큼 줄어든다). 이동이 읽음 요청을 기다리지 않게 fire-and-navigate —
// 실패해도 다음 클릭에 다시 기회가 있어 UX 를 막지 않는다.
export const DecisionAlertCard = ({ alert }: DecisionAlertCardProps) => {
  const router = useRouter();
  const [readLocally, setReadLocally] = useState(false);
  const Icon = ICONS[alert.icon];
  const unread = alert.unread && !readLocally;

  function open() {
    setReadLocally(true);
    const marked = alert.unread
      ? markNotificationReadAction({ notificationId: alert.id }).catch(() => undefined)
      : Promise.resolve();
    if (alert.href) {
      router.push(alert.href);
      return;
    }
    // 이동할 곳 없는 알림 — 읽음만 반영되게 목록을 새로고침.
    void marked.then(() => router.refresh());
  }

  return (
    <Card className="p-0">
      <button type="button" onClick={open} className="flex w-full items-center gap-3 p-4 text-left">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            TONE[alert.tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ink-900 flex items-center gap-1.5 text-[14px] font-semibold">
            <span className="truncate">{alert.title}</span>
            {unread && (
              <span
                className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full"
                aria-label="읽지 않음"
              />
            )}
          </p>
          <p className="text-ink-400 mt-0.5 text-[12px]">{alert.subtitle}</p>
        </div>
        {alert.href && <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />}
      </button>
    </Card>
  );
};
