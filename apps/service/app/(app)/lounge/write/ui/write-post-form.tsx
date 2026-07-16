'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';
import type { DB } from '@mungsan/db';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { createLoungePostAction } from '../../commands/create-lounge-post.action';

// 카테고리 칩 셀렉터 — ui 로컬 표시 어휘(client 번들 보호 위해 DB는 type-only).
const CATEGORY_VALUES = [
  'COLLABORATION',
  'BUSINESS_CONCERN',
  'INVESTMENT_FUNDING',
  'DEVELOPMENT_TECH',
  'MARKETING_SALES',
  'GOVERNMENT_SUPPORT',
  'ETC',
] as const;

const CATEGORY_LABELS: Record<DB.LoungeCategory, string> = {
  COLLABORATION: '협업 제안',
  BUSINESS_CONCERN: '사업 고민',
  INVESTMENT_FUNDING: '투자·자금',
  DEVELOPMENT_TECH: '개발·기술',
  MARKETING_SALES: '마케팅·영업',
  GOVERNMENT_SUPPORT: '정부지원',
  ETC: '기타',
};

const schema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요.').max(120, '제목은 120자 이내로 입력해 주세요.'),
  content: z.string().trim().min(1, '내용을 입력해 주세요.'),
  category: z.enum(CATEGORY_VALUES, { error: '카테고리를 선택해 주세요.' }),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export const WritePostForm = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '', category: undefined },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createLoungePostAction(values);
    if (!result.ok) {
      if (result.field === 'title' || result.field === 'content' || result.field === 'category')
        setError(result.field, { message: result.message });
      else toast.error(result.message);
      return;
    }
    setIsRedirecting(true);
    toast.success(result.message);
    router.push('/lounge');
  });

  const busy = isSubmitting || isRedirecting;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>카테고리</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {CATEGORY_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                  className={cn(
                    'rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
                    field.value === value
                      ? 'border-brand bg-brand text-white'
                      : 'border-ink-200 text-ink-600 bg-white',
                  )}
                >
                  {CATEGORY_LABELS[value]}
                </button>
              ))}
            </div>
          )}
        />
        {errors.category && <p className="text-danger text-xs">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" {...register('title')} placeholder="제목을 입력해 주세요." />
        {errors.title && <p className="text-danger text-xs">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder="다른 대표들과 나누고 싶은 이야기를 적어주세요."
          className="min-h-40"
        />
        {errors.content && <p className="text-danger text-xs">{errors.content.message}</p>}
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        등록하기
      </Button>
    </form>
  );
};
