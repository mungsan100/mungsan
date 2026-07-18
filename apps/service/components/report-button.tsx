'use client';

import { useState, useTransition } from 'react';
import { LuFlag, LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import type { DB } from '@mungsan/db';

import { createReportAction } from '@/app/(app)/commands/create-report.action';

// 신고 사유 → 표시 라벨. 표시 매핑이라 소비처(ui) 로컬.
const REASON_OPTIONS: { value: DB.ReportReason; label: string }[] = [
  { value: 'SPAM', label: '스팸/광고' },
  { value: 'ABUSE', label: '욕설/비방' },
  { value: 'FALSE_INFO', label: '허위정보' },
  { value: 'OTHER', label: '기타' },
];

interface ReportButtonProps {
  targetType: DB.ReportTargetType;
  targetId: string;
  compact?: boolean; // 댓글용 — 아이콘 없이 작은 텍스트 버튼
}

// 신고 버튼 + 인라인 사유 선택 패널(라운지 글/댓글·협업 공고 공용).
// 접수되면 토스트로만 알리고 진행상황은 신고자에게 노출하지 않는다.
export const ReportButton = ({ targetType, targetId, compact = false }: ReportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DB.ReportReason>('SPAM');
  const [detail, setDetail] = useState('');
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setReason('SPAM');
    setDetail('');
  }

  function submit() {
    startTransition(async () => {
      const result = await createReportAction({
        targetType,
        targetId,
        reason,
        detail: detail.trim() || null,
      });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      close();
    });
  }

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? 'text-ink-400 text-xs font-medium'
            : 'text-ink-400 hover:text-ink-600 flex items-center gap-1 text-[13px]'
        }
        aria-label="신고"
      >
        {!compact && <LuFlag className="h-3.5 w-3.5" />}
        신고
      </button>
    );

  return (
    <div className="border-ink-200 w-full space-y-3 rounded-xl border bg-white p-3 text-left">
      <p className="text-ink-900 text-sm font-bold">이 콘텐츠를 신고하시겠어요?</p>
      <div className="space-y-1.5">
        {REASON_OPTIONS.map((option) => (
          <label key={option.value} className="text-ink-700 flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`report-reason-${targetId}`}
              checked={reason === option.value}
              onChange={() => setReason(option.value)}
              className="accent-brand h-3.5 w-3.5"
            />
            {option.label}
          </label>
        ))}
      </div>
      {reason === 'OTHER' && (
        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={500}
          placeholder="신고 사유를 입력해 주세요"
          className="border-ink-200 text-ink-900 placeholder:text-ink-400 focus:border-ink-500 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
        />
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          disabled={isPending}
          className="text-ink-500 rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="bg-danger flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          신고하기
        </button>
      </div>
    </div>
  );
};
