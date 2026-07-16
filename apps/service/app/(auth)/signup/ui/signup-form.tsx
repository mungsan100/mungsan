'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';
import type { DB } from '@mungsan/db';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { signupAction } from '@/app/(auth)/signup/commands/signup.action';

const EXECUTIVE_ROLE_VALUES = [
  'CEO',
  'COO',
  'CTO',
  'CFO',
  'CMO',
  'CISO',
  'CPO',
  'FOUNDER',
  'CHAIRMAN',
  'OTHER',
] as const;

const EXECUTIVE_ROLE_LABELS: Record<DB.ExecutiveRole, string> = {
  CEO: '대표이사(CEO)',
  COO: '최고운영책임자(COO)',
  CTO: '최고기술책임자(CTO)',
  CFO: '최고재무책임자(CFO)',
  CMO: '최고마케팅책임자(CMO)',
  CISO: '최고정보보안책임자(CISO)',
  CPO: '최고제품책임자(CPO)',
  FOUNDER: '창업자',
  CHAIRMAN: '의장/회장',
  OTHER: '기타(직접 입력)',
};

const schema = z
  .object({
    name: z.string().trim().min(1, '이름을 입력해 주세요.'),
    phone: z.string().trim().min(1, '연락처를 입력해 주세요.'),
    email: z.string().trim().email('올바른 이메일 형식이 아닙니다.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    executiveRole: z.enum(EXECUTIVE_ROLE_VALUES, { error: '직책을 선택해 주세요.' }),
    jobTitle: z.string().trim().optional(),
    agreedTerms: z.boolean().refine((v) => v, { message: '이용약관에 동의해 주세요.' }),
    agreedPrivacy: z.boolean().refine((v) => v, { message: '개인정보 수집·이용에 동의해 주세요.' }),
    agreedMarketing: z.boolean(),
  })
  .refine((v) => v.executiveRole !== 'OTHER' || Boolean(v.jobTitle?.trim()), {
    message: '직책을 입력해 주세요.',
    path: ['jobTitle'],
  });
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export const SignupForm = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      executiveRole: undefined,
      jobTitle: '',
      agreedTerms: false,
      agreedPrivacy: false,
      agreedMarketing: false,
    },
  });

  const executiveRole = watch('executiveRole');

  const onSubmit = handleSubmit(async (values) => {
    const result = await signupAction({
      name: values.name,
      phone: values.phone,
      email: values.email,
      password: values.password,
      executiveRole: values.executiveRole,
      jobTitle: values.jobTitle?.trim() || null,
      agreedTerms: values.agreedTerms,
      agreedPrivacy: values.agreedPrivacy,
      agreedMarketing: values.agreedMarketing,
    });
    if (!result.ok) {
      if (
        result.field === 'name' ||
        result.field === 'phone' ||
        result.field === 'email' ||
        result.field === 'password' ||
        result.field === 'jobTitle'
      )
        setError(result.field, { message: result.message });
      else toast.error(result.message);
      return;
    }
    // 성공 시 signupAction 내부에서 redirect('/company')가 실행된다.
    setIsRedirecting(true);
  });

  const busy = isSubmitting || isRedirecting;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" {...register('name')} placeholder="홍길동" />
        {errors.name && <p className="text-danger text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">연락처</Label>
        <Input id="phone" {...register('phone')} placeholder="010-0000-0000" />
        {errors.phone && <p className="text-danger text-xs">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" {...register('email')} placeholder="you@company.com" />
        {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" type="password" {...register('password')} placeholder="8자 이상" />
        {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="executiveRole">직책</Label>
        <Select id="executiveRole" {...register('executiveRole')} defaultValue="">
          <option value="" disabled>
            직책을 선택해 주세요
          </option>
          {EXECUTIVE_ROLE_VALUES.map((value) => (
            <option key={value} value={value}>
              {EXECUTIVE_ROLE_LABELS[value]}
            </option>
          ))}
        </Select>
        {errors.executiveRole && <p className="text-danger text-xs">{errors.executiveRole.message}</p>}
      </div>

      {executiveRole === 'OTHER' && (
        <div className="space-y-2">
          <Label htmlFor="jobTitle">직책 직접 입력</Label>
          <Input id="jobTitle" {...register('jobTitle')} placeholder="예: 부사장" />
          {errors.jobTitle && <p className="text-danger text-xs">{errors.jobTitle.message}</p>}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Controller
          control={control}
          name="agreedTerms"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              이용약관에 동의합니다 (필수)
            </label>
          )}
        />
        {errors.agreedTerms && <p className="text-danger text-xs">{errors.agreedTerms.message}</p>}

        <Controller
          control={control}
          name="agreedPrivacy"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              개인정보 수집·이용에 동의합니다 (필수)
            </label>
          )}
        />
        {errors.agreedPrivacy && <p className="text-danger text-xs">{errors.agreedPrivacy.message}</p>}

        <Controller
          control={control}
          name="agreedMarketing"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              마케팅 정보 수신에 동의합니다 (선택)
            </label>
          )}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        회원가입
      </Button>

      <p className="text-ink-500 text-center text-sm">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-brand font-semibold">
          로그인
        </Link>
      </p>
    </form>
  );
};
