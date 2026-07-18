'use client';

import { useState, useTransition } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { changePasswordAction } from '../commands/change-password.action';

// 비밀번호 변경 — 접힌 상태에서 펼쳐 현재/새 비밀번호 입력. 성공 시 타 기기 세션이 파기된다.
export const ChangePasswordForm = () => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setError(null);
  }

  function change() {
    if (!currentPassword || !newPassword) {
      setError({ message: '현재 비밀번호와 새 비밀번호를 입력해 주세요.' });
      return;
    }
    startTransition(async () => {
      const result = await changePasswordAction({ currentPassword, newPassword });
      if (!result.ok) {
        setError({ field: result.field, message: result.message });
        return;
      }
      toast.success(result.message);
      close();
    });
  }

  if (!open)
    return (
      <div className="flex items-center justify-between">
        <p className="text-ink-900 text-sm font-bold">비밀번호</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-brand text-xs font-semibold underline underline-offset-2"
        >
          비밀번호 변경
        </button>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-ink-900 text-sm font-bold">비밀번호 변경</p>
      <div className="space-y-2">
        <Label htmlFor="current-password">현재 비밀번호</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error?.field === 'currentPassword' && (
          <p className="text-danger text-xs">{error.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">새 비밀번호</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="8자 이상"
          autoComplete="new-password"
        />
        {error?.field === 'newPassword' && <p className="text-danger text-xs">{error.message}</p>}
      </div>
      {error && !error.field && <p className="text-danger text-xs">{error.message}</p>}
      <p className="text-ink-400 text-xs">변경하면 다른 기기에서는 자동으로 로그아웃됩니다.</p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={close} disabled={isPending}>
          취소
        </Button>
        <Button type="button" variant="primary" onClick={change} disabled={isPending}>
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          변경
        </Button>
      </div>
    </div>
  );
};
