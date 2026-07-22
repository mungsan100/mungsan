'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';

import { markAllNotificationsReadAction } from '@/app/(app)/commands/mark-notifications-read-bulk.action';

// "모두 읽음" 버튼(2026-07-22) — 탭과 무관하게 내 미읽음 전부를 읽음 처리.
// 서버(page)가 미읽음이 있을 때만 렌더하므로 여기선 동작만 담당한다.
export const MarkAllReadButton = () => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await markAllNotificationsReadAction().catch(() => null);
          if (result?.ok) toast.success(result.message);
          else toast.error('읽음 처리에 실패했어요. 잠시 후 다시 시도해 주세요.');
        })
      }
      className="text-ink-500 border-ink-200 inline-flex h-8 items-center justify-center rounded-full border bg-white px-3 text-[12px] font-semibold disabled:opacity-60"
    >
      모두 읽음
    </button>
  );
};
