'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { callAction } from '@/lib/forms/call-action';
import { resetPasswordAction } from '@/app/(auth)/reset-password/commands/reset-password.action';

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [invalidToken, setInvalidToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await callAction(
      () => resetPasswordAction({ token, password }),
      '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    if (result === null) {
      setBusy(false);
      return;
    }
    if (!result.ok) {
      setBusy(false);
      if (result.code === 'INVALID_TOKEN') setInvalidToken(result.message);
      else if (result.field === 'password') setError(result.message);
      else toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.push('/login');
  }

  if (invalidToken)
    return (
      <div className="space-y-4 text-center">
        <p className="text-ink-700 text-sm">{invalidToken}</p>
        <Link href="/reset-password" className="text-brand text-sm font-semibold underline">
          재설정 다시 요청하기
        </Link>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">새 비밀번호</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          placeholder="8자 이상"
          autoComplete="new-password"
        />
        {error && <p className="text-danger text-xs">{error}</p>}
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        비밀번호 변경
      </Button>
    </form>
  );
};
