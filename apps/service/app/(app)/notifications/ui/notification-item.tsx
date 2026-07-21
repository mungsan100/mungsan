'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuChevronRight,
  LuMessageSquare,
  LuHandshake,
  LuMegaphone,
  LuSparkles,
  LuCircleCheck,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';

import { cn } from '@/lib/utils';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { markNotificationReadAction } from '@/app/(app)/commands/mark-notification-read.action';
import type { NotificationRow } from '../tabs';

// 알림 종류 → 아이콘·톤. 지원사업(맞춤 공고)은 SYSTEM+/support 로 구분해 별도 아이콘.
function iconTone(n: NotificationRow): { Icon: IconType; tone: string } {
  if (n.type === 'LOUNGE') return { Icon: LuMessageSquare, tone: 'bg-sky-50 text-sky-600' };
  if (n.type === 'COLLABORATION' || n.type === 'PROJECT')
    return { Icon: LuHandshake, tone: 'bg-amber-50 text-amber-600' };
  if (n.type === 'MEMBERSHIP') return { Icon: LuCircleCheck, tone: 'bg-emerald-50 text-emerald-600' };
  // SYSTEM
  if (n.linkUrl?.startsWith('/support'))
    return { Icon: LuSparkles, tone: 'bg-brand-soft text-brand' };
  return { Icon: LuMegaphone, tone: 'bg-violet-50 text-violet-600' };
}

// 알림 한 건 — 아이콘 + 제목 + 미리보기(body) + 상대시각. 안읽음이면 배경 틴트 + 점 표식.
// 클릭 시 읽음 처리(기존 markNotificationReadAction 재사용) 후 linkUrl 로 이동.
export function NotificationItem({ notification: n }: { notification: NotificationRow }) {
  const router = useRouter();
  const [readLocally, setReadLocally] = useState(false);
  const unread = n.readAt == null && !readLocally;
  const { Icon, tone } = iconTone(n);

  function open() {
    setReadLocally(true);
    const marked =
      n.readAt == null
        ? markNotificationReadAction({ notificationId: n.id }).catch(() => undefined)
        : Promise.resolve();
    if (n.linkUrl) {
      router.push(n.linkUrl);
      return;
    }
    void marked.then(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl p-4 text-left',
        unread ? 'bg-brand-soft/60' : 'bg-white',
        'shadow-card',
      )}
    >
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink-900 flex items-center gap-1.5 text-[14px] font-semibold">
          <span className="truncate">{n.title}</span>
          {unread && <span className="bg-brand h-2 w-2 shrink-0 rounded-full" aria-label="읽지 않음" />}
        </p>
        {n.body && <p className="text-ink-500 mt-0.5 line-clamp-2 text-[13px]">{n.body}</p>}
        <p className="text-ink-400 mt-1 text-[12px]">{formatRelativeKorean(n.createdAt)}</p>
      </div>
      {n.linkUrl && <LuChevronRight className="text-ink-300 mt-1 h-5 w-5 shrink-0" />}
    </button>
  );
}
