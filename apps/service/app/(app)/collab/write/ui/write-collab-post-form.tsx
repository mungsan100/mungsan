'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type { IndustryOption } from '../../queries/collab-industries.query';
import type { SkillOption } from '../../queries/collab-skills.query';
import { createCollabPostAction } from '../../commands/create-collab-post.action';

// 예산(천원) — 빈칸은 null, 채우면 0 이상 정수.
const budgetField = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\d+$/.test(v), '0 이상의 정수를 입력해 주세요.')
  .transform((v) => (v === '' ? null : Number(v)));

// 날짜 — 빈칸은 null, 채우면 Date로 변환(date input은 YYYY-MM-DD 문자열).
const dateField = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : new Date(v)));

const optionalText = z
  .string()
  .trim()
  .transform((v) => v || null);

const schema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, '제목을 입력해 주세요.')
      .max(120, '제목은 120자 이내로 입력해 주세요.'),
    description: z.string().trim().min(1, '협업 내용을 입력해 주세요.'),
    minBudgetInCheonwon: budgetField,
    maxBudgetInCheonwon: budgetField,
    region: optionalText,
    collaborationMethod: optionalText,
    startDate: dateField,
    endDate: dateField,
    requiredSkillIds: z.array(z.string()),
    industryTagIds: z.array(z.string()),
    isPublic: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (
      val.minBudgetInCheonwon != null &&
      val.maxBudgetInCheonwon != null &&
      val.minBudgetInCheonwon > val.maxBudgetInCheonwon
    )
      ctx.addIssue({
        code: 'custom',
        message: '최소 예산은 최대 예산보다 클 수 없습니다.',
        path: ['maxBudgetInCheonwon'],
      });
  });

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const EMPTY: FormInput = {
  title: '',
  description: '',
  minBudgetInCheonwon: '',
  maxBudgetInCheonwon: '',
  region: '',
  collaborationMethod: '',
  startDate: '',
  endDate: '',
  requiredSkillIds: [],
  industryTagIds: [],
  isPublic: true,
};

const FIELD_KEYS = ['title', 'description', 'maxBudgetInCheonwon'] as const;

interface WriteCollabPostFormProps {
  industries: IndustryOption[];
  skills: SkillOption[];
}

export const WriteCollabPostForm = ({ industries, skills }: WriteCollabPostFormProps) => {
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
    defaultValues: EMPTY,
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createCollabPostAction(values);
    if (!result.ok) {
      if (result.field && (FIELD_KEYS as readonly string[]).includes(result.field))
        setError(result.field as (typeof FIELD_KEYS)[number], { message: result.message });
      else toast.error(result.message);
      return;
    }
    setIsRedirecting(true);
    toast.success(result.message);
    router.push(`/collab/${result.data.id}`);
  });

  const busy = isSubmitting || isRedirecting;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" {...register('title')} placeholder="어떤 협업을 찾고 계신가요?" />
        {errors.title && <p className="text-danger text-xs">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">협업 내용</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="협업 목적, 필요한 파트너, 기대 효과를 적어주세요."
          className="min-h-40"
        />
        {errors.description && <p className="text-danger text-xs">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>예산 (천원)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            {...register('minBudgetInCheonwon')}
            placeholder="최소"
          />
          <span className="text-ink-400 shrink-0 text-sm">~</span>
          <Input
            type="number"
            inputMode="numeric"
            {...register('maxBudgetInCheonwon')}
            placeholder="최대"
          />
        </div>
        {errors.minBudgetInCheonwon && (
          <p className="text-danger text-xs">{errors.minBudgetInCheonwon.message}</p>
        )}
        {errors.maxBudgetInCheonwon && (
          <p className="text-danger text-xs">{errors.maxBudgetInCheonwon.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">지역</Label>
        <Input id="region" {...register('region')} placeholder="예: 서울 강남" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="collaborationMethod">협업 방식</Label>
        <Input
          id="collaborationMethod"
          {...register('collaborationMethod')}
          placeholder="예: 지분 투자, 공동 개발, 외주 계약"
        />
      </div>

      <div className="space-y-2">
        <Label>협업 기간</Label>
        <div className="flex items-center gap-2">
          <Input type="date" {...register('startDate')} className="text-ink-700" />
          <span className="text-ink-400 shrink-0 text-sm">~</span>
          <Input type="date" {...register('endDate')} className="text-ink-700" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>필요 역량</Label>
        <Controller
          control={control}
          name="requiredSkillIds"
          render={({ field }) => (
            <ChipMultiSelect options={skills} value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>업종</Label>
        <Controller
          control={control}
          name="industryTagIds"
          render={({ field }) => (
            <ChipMultiSelect options={industries} value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>공개 여부</Label>
        <Controller
          control={control}
          name="isPublic"
          render={({ field }) => (
            <div className="flex gap-2">
              {[
                { value: true, label: '공개' },
                { value: false, label: '비공개' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    field.value === opt.value
                      ? 'border-brand bg-brand text-white'
                      : 'border-ink-200 text-ink-600 bg-white',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        공고 등록하기
      </Button>
    </form>
  );
};

const ChipMultiSelect = ({
  options,
  value,
  onChange,
}: {
  options: { id: string; name: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}) => {
  if (options.length === 0)
    return <p className="text-ink-400 text-sm">선택할 항목이 없습니다.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() =>
              onChange(active ? value.filter((id) => id !== opt.id) : [...value, opt.id])
            }
            className={cn(
              'rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
              active ? 'border-brand bg-brand text-white' : 'border-ink-200 text-ink-600 bg-white',
            )}
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  );
};
