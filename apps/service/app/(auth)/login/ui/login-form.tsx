'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/app/(auth)/login/commands/login.action';

const schema = z.object({
  email: z.string().trim().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export const LoginForm = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await loginAction(values);
    if (!result.ok) {
      if (result.field === 'email' || result.field === 'password')
        setError(result.field, { message: result.message });
      else toast.error(result.message);
      return;
    }
    // 성공 시 loginAction 내부에서 redirect('/')가 실행된다.
    setIsRedirecting(true);
  });

  const busy = isSubmitting || isRedirecting;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" {...register('email')} placeholder="you@company.com" />
        {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" type="password" {...register('password')} placeholder="비밀번호" />
        {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        로그인
      </Button>

      <p className="text-ink-500 text-center text-sm">
        아직 계정이 없으신가요?{' '}
        <Link href="/signup" className="text-brand font-semibold">
          회원가입
        </Link>
      </p>
      <p className="text-center">
        <Link
          href="/reset-password"
          className="text-ink-400 text-xs underline underline-offset-2"
        >
          비밀번호를 잊으셨나요?
        </Link>
      </p>
    </form>
  );
};
