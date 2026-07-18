'use client';

import { useState } from 'react';
import { LuLoaderCircle, LuMailCheck } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { callAction } from '@/lib/forms/call-action';
import { requestPasswordResetAction } from '@/app/(auth)/reset-password/commands/request-password-reset.action';

export const RequestResetForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await callAction(
      () => requestPasswordResetAction({ email }),
      '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setBusy(false);
    if (result === null) return;
    if (!result.ok) {
      if (result.field === 'email') setError(result.message);
      else toast.error(result.message);
      return;
    }
    setSent(true);
  }

  if (sent)
    return (
      <div className="space-y-2 text-center">
        <LuMailCheck className="text-brand mx-auto h-8 w-8" />
        <p className="text-ink-700 text-sm">
          해당 이메일로 가입된 계정이 있으면
          <br />
          재설정 안내 메일을 보내드렸습니다.
        </p>
        <p className="text-ink-400 text-xs">메일이 오지 않으면 스팸함도 확인해 주세요.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="you@company.com"
          autoComplete="email"
        />
        {error && <p className="text-danger text-xs">{error}</p>}
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        재설정 링크 보내기
      </Button>
    </form>
  );
};
