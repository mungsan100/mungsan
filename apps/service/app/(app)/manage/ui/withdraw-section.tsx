'use client';

import { useState, useTransition } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { withdrawAccountAction } from '../commands/withdraw-account.action';

// 회원 탈퇴 — 접힌 상태의 텍스트 버튼 → 펼치면 안내 + 비밀번호 재확인 + 탈퇴 확정.
// 성공 시 액션 내부 redirect('/login')가 실행된다.
export const WithdrawSection = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function withdraw() {
    if (!password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    startTransition(async () => {
      const result = await withdrawAccountAction({ password });
      if (!result.ok) {
        if (result.field === 'password') setError(result.message);
        else toast.error(result.message);
        return;
      }
    });
  }

  if (!open)
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-ink-400 text-xs underline underline-offset-2"
        >
          회원 탈퇴
        </button>
      </div>
    );

  return (
    <div className="border-ink-200 space-y-3 rounded-2xl border bg-white p-4">
      <p className="text-ink-900 text-sm font-bold">회원 탈퇴</p>
      <p className="text-ink-500 text-xs leading-relaxed">
        탈퇴하면 계정이 비활성화되어 더 이상 로그인할 수 없습니다. 같은 이메일로 다시 가입할 수
        없으며, 복구가 필요하면 운영팀에 문의해 주세요.
      </p>
      <div className="space-y-1">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          placeholder="비밀번호 확인"
          autoComplete="current-password"
          className="border-ink-200 text-ink-900 placeholder:text-ink-400 focus:border-ink-500 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
        />
        {error && <p className="text-danger text-xs">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setPassword('');
            setError(null);
          }}
          disabled={isPending}
          className="text-ink-500 rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="button"
          onClick={withdraw}
          disabled={isPending}
          className="bg-danger flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          탈퇴하기
        </button>
      </div>
    </div>
  );
};
