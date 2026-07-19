'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { suspendMemberAction, unsuspendMemberAction } from '../commands/suspend-member.action';

// 이용 정지/해제 패널 — 정지는 되돌릴 수 있지만 전 세션이 즉시 끊기므로 인라인 확인 단계를 둔다.
export const SuspendPanel = ({
  userId,
  suspended,
  withdrawn,
}: {
  userId: string;
  suspended: boolean;
  withdrawn: boolean;
}) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function run(action: typeof suspendMemberAction) {
    startTransition(async () => {
      const result = await action({ userId });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      setConfirming(false);
      router.refresh();
    });
  }

  if (withdrawn)
    return <p className="text-sm text-slate-500">탈퇴한 회원은 정지 대상이 아닙니다.</p>;

  if (suspended)
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-600">현재 이용 정지 상태입니다.</p>
        <button
          type="button"
          onClick={() => run(unsuspendMemberAction)}
          disabled={isPending}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          정지 해제
        </button>
      </div>
    );

  if (!confirming)
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        이용 정지
      </button>
    );

  return (
    <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <div>
        <p className="text-sm font-bold text-slate-900">이 회원의 이용을 정지할까요?</p>
        <p className="mt-0.5 text-xs text-slate-600">
          정지 즉시 모든 기기에서 로그아웃되고, 해제 전까지 로그인해도 정지 안내만 보게 됩니다.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => run(suspendMemberAction)}
          disabled={isPending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          정지하기
        </button>
      </div>
    </div>
  );
};
