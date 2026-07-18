'use client';

import { useState } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

import { adminLoginAction } from '@/app/login/commands/admin-login.action';

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none';

export const AdminLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setBusy(true);
    setError(null);
    const result = await adminLoginAction({ email, password });
    if (!result.ok) {
      setError(result.message);
      setBusy(false);
      return;
    }
    // 성공 시 adminLoginAction 내부에서 redirect('/approvals')가 실행된다 — busy 유지.
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          autoComplete="username"
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className={inputClassName}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
        로그인
      </button>
    </form>
  );
};
