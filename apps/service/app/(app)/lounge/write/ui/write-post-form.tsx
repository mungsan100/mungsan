'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoaderCircle, LuSparkles } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { createLoungePostAction } from '../../commands/create-lounge-post.action';

// 카테고리는 등록 시 AI가 자동 분류한다(2026-07-20, 5-3) — 폼에서 직접 고르지 않는다.
const schema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요.').max(120, '제목은 120자 이내로 입력해 주세요.'),
  content: z.string().trim().min(1, '내용을 입력해 주세요.'),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export const WritePostForm = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createLoungePostAction(values);
    if (!result.ok) {
      if (result.field === 'title' || result.field === 'content')
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

      <p className="text-ink-400 bg-ink-100 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px]">
        <LuSparkles className="text-brand h-3.5 w-3.5 shrink-0" />
        카테고리는 등록 시 자동으로 분류돼요. 등록 후 글에서 직접 바꿀 수 있습니다.
      </p>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        등록하기
      </Button>
    </form>
  );
};
