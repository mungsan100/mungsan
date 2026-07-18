'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import type { DB } from '@mungsan/db';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import { dismissReportAction } from '../commands/dismiss-report.action';
import { hideContentAction } from '../commands/hide-content.action';

interface ReportDecisionPanelProps {
  reportId: string;
  status: DB.ReportStatus;
  resolvedAt: Date | null;
}

// 신고 처리 패널 — 액션 2개: 콘텐츠 숨기기 / 신고 반려. 처리 완료 건은 결과만 표시.
export const ReportDecisionPanel = ({ reportId, status, resolvedAt }: ReportDecisionPanelProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  if (status !== 'PENDING')
    return (
      <p className="text-sm text-slate-600">
        {status === 'CONTENT_HIDDEN' ? '콘텐츠 숨김으로 처리됨' : '반려로 처리됨'}
        {resolvedAt && ` — ${formatKstDateTime(resolvedAt)}`}
      </p>
    );

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        숨기기는 해당 콘텐츠만 비공개 처리합니다(삭제 아님 — 복원은 운영팀 문의). 반려는 조치
        없이 신고를 종료합니다.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => run(() => dismissReportAction({ reportId }))}
          disabled={isPending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          신고 반려
        </button>
        <button
          type="button"
          onClick={() => run(() => hideContentAction({ reportId }))}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
        >
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          콘텐츠 숨기기
        </button>
      </div>
    </div>
  );
};
