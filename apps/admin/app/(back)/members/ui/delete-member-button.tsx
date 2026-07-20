'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteMemberAction } from '../commands/delete-member.action';

// 회원 삭제 버튼(목록 행) — 되돌리기 어려운 조치라 확인 모달을 강제한다(2026-07-20, 5-2).
export const DeleteMemberButton = ({
  userId,
  memberName,
}: {
  userId: string;
  memberName: string;
}) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await deleteMemberAction({ userId });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        삭제
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <p className="text-sm font-bold text-slate-900">
              {memberName} 회원을 정말 삭제하시겠습니까?
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              즉시 모든 기기에서 로그아웃되고 로그인이 차단됩니다. 계정은 비활성화 방식으로
              처리되며(콘텐츠·동의 이력 보존), 복구가 필요하면 운영자가 되돌릴 수 있습니다.
            </p>
            <div className="mt-4 flex justify-end gap-2">
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
                onClick={remove}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
