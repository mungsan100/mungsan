'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import { approveSignupAction } from '../commands/approve-signup.action';
import { rejectSignupAction } from '../commands/reject-signup.action';

interface DecisionPanelProps {
  userId: string;
  status: 'PENDING' | 'REJECTED';
  rejectedAt: Date | null;
  rejectedReason: string | null;
}

// 승인/반려 처리 패널. 반려는 사유 입력(선택)을 펼친 뒤 확정하는 2단계.
// 반려된 건에는 "승인으로 전환"(오반려 복구)만 노출한다.
export const DecisionPanel = ({ userId, status, rejectedAt, rejectedReason }: DecisionPanelProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  function approve() {
    startTransition(async () => {
      const result = await approveSignupAction({ userId });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectSignupAction({ userId, reason });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  if (status === 'REJECTED') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">
            반려됨 — {rejectedAt && formatKstDateTime(rejectedAt)}
          </p>
          <p className="mt-1 text-sm text-red-600">
            {rejectedReason ?? '입력된 반려 사유가 없습니다.'}
          </p>
        </div>
        <button
          type="button"
          onClick={approve}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          승인으로 전환
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowRejectForm((v) => !v)}
          disabled={isPending}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          반려
        </button>
        <button
          type="button"
          onClick={approve}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          승인
        </button>
      </div>

      {showRejectForm && (
        <div className="space-y-2 rounded-lg border border-red-100 bg-red-50 p-4">
          <label htmlFor="reject-reason" className="text-sm font-semibold text-slate-700">
            반려 사유 <span className="font-normal text-slate-400">(선택, 500자 이하)</span>
          </label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="예: 사업자등록증이 확인되지 않습니다."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-white disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={reject}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
            >
              {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
              반려 확정
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
