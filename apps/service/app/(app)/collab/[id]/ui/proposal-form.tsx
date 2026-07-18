'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { LuLoaderCircle, LuSave } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { callAction } from '@/lib/forms/call-action';

import { createProposalAction } from '../../commands/create-proposal.action';
import { saveProposalDraftAction } from '../../commands/save-proposal-draft.action';
import type { ProposalDraft } from '../../queries/collab-detail.query';

// 구조화 제안 폼(PRD FR-CLBMK-3) — 자기소개·관심 이유는 필수, 나머지는 선택.
// 임시 저장은 검증 없이(비어있지만 않으면) DRAFT 로 보관되고 재진입 시 복원된다.
const optionalField = z.string().trim().max(500, '500자 이내로 입력해 주세요.').optional();

const proposalSchema = z.object({
  introduction: z
    .string()
    .trim()
    .min(10, '자기소개를 10자 이상 입력해 주세요.')
    .max(500, '500자 이내로 입력해 주세요.'),
  interestReason: z
    .string()
    .trim()
    .min(10, '관심 이유를 10자 이상 입력해 주세요.')
    .max(500, '500자 이내로 입력해 주세요.'),
  contributionCapability: optionalField,
  collaborationMethod: optionalField,
  meetingAvailability: optionalField,
  contributionRole: z.string().trim().max(100, '기여 역할은 100자 이내로 입력해 주세요.').optional(),
  // 참고 자료 — 공고 첨부와 동일 정책(최대 3개·개당 5MB). 서버 검증과 값을 맞출 것.
  attachments: z
    .array(z.instanceof(File))
    .max(3, '참고 자료는 최대 3개까지 첨부할 수 있습니다.')
    .refine((files) => files.every((f) => f.size <= 5 * 1024 * 1024), '참고 자료는 개당 5MB 이하여야 합니다.'),
});
type ProposalInput = z.input<typeof proposalSchema>;
type ProposalOutput = z.output<typeof proposalSchema>;

const FIELD_KEYS = [
  'introduction',
  'interestReason',
  'contributionCapability',
  'collaborationMethod',
  'meetingAvailability',
  'contributionRole',
  'attachments',
] as const;

interface ProposalFormProps {
  postId: string;
  draft: ProposalDraft | null;
}

export const ProposalForm = ({ postId, draft }: ProposalFormProps) => {
  const router = useRouter();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProposalInput, unknown, ProposalOutput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      introduction: draft?.introduction ?? '',
      interestReason: draft?.interestReason ?? '',
      contributionCapability: draft?.contributionCapability ?? '',
      collaborationMethod: draft?.collaborationMethod ?? '',
      meetingAvailability: draft?.meetingAvailability ?? '',
      contributionRole: draft?.contributionRole ?? '',
      attachments: [],
    },
  });

  function applyFieldError(field: string | undefined, message: string) {
    if (field && (FIELD_KEYS as readonly string[]).includes(field))
      setError(field as (typeof FIELD_KEYS)[number], { message });
    else toast.error(message);
  }

  async function onSubmit(values: ProposalOutput) {
    const res = await callAction(
      () => createProposalAction({ postId, ...normalize(values), attachments: values.attachments }),
      '제안 전송에 실패했습니다. 파일이 너무 크거나 네트워크 문제일 수 있어요.',
    );
    if (res === null) return;
    if (!res.ok) {
      applyFieldError(res.field, res.message);
      return;
    }
    toast.success(res.message);
    reset();
    router.refresh();
  }

  // 임시 저장 — 폼 검증 없이 현재 입력값 그대로 보관(빈 폼만 서버에서 거부).
  async function saveDraft() {
    if (isSavingDraft || isSubmitting) return;
    setIsSavingDraft(true);
    const res = await callAction(
      () => saveProposalDraftAction({ postId, ...normalize(getValues()) }),
      '임시 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setIsSavingDraft(false);
    if (res === null) return;
    if (!res.ok) {
      applyFieldError(res.field, res.message);
      return;
    }
    toast.success(res.message);
    router.refresh();
  }

  const busy = isSubmitting || isSavingDraft;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      {draft && (
        <p className="bg-brand-soft text-brand-sub02 rounded-lg px-3 py-2 text-[12px] font-semibold">
          임시 저장된 제안을 불러왔어요. 이어서 작성한 뒤 보내면 됩니다.
        </p>
      )}

      <Field id="introduction" label="자기소개" error={errors.introduction?.message}>
        <Textarea
          id="introduction"
          placeholder="회사와 본인을 간단히 소개해 주세요."
          className="min-h-20"
          {...register('introduction')}
        />
      </Field>

      <Field id="interestReason" label="관심 이유" error={errors.interestReason?.message}>
        <Textarea
          id="interestReason"
          placeholder="이 협업에 관심을 갖게 된 이유를 적어주세요."
          className="min-h-20"
          {...register('interestReason')}
        />
      </Field>

      <Field
        id="contributionCapability"
        label="기여 가능 역량 (선택)"
        error={errors.contributionCapability?.message}
      >
        <Textarea
          id="contributionCapability"
          placeholder="협업에 기여할 수 있는 역량·자원을 적어주세요."
          className="min-h-16"
          {...register('contributionCapability')}
        />
      </Field>

      <Field
        id="collaborationMethod"
        label="협업 가능 방식 (선택)"
        error={errors.collaborationMethod?.message}
      >
        <Input
          id="collaborationMethod"
          placeholder="예: 공동 개발, 위탁 수행, 지분 참여"
          {...register('collaborationMethod')}
        />
      </Field>

      <Field
        id="meetingAvailability"
        label="미팅 가능 일정 (선택)"
        error={errors.meetingAvailability?.message}
      >
        <Input
          id="meetingAvailability"
          placeholder="예: 평일 오후, 다음 주 화·목"
          {...register('meetingAvailability')}
        />
      </Field>

      <Field id="contributionRole" label="기여 역할 (선택)" error={errors.contributionRole?.message}>
        <Input
          id="contributionRole"
          placeholder="예: SI 구축, B2B 영업, 기획 운영"
          {...register('contributionRole')}
        />
      </Field>

      <Field
        id="attachments"
        label="참고 자료 (선택, 최대 3개 · 개당 5MB)"
        error={errors.attachments?.message}
      >
        <Controller
          control={control}
          name="attachments"
          render={({ field: { onChange, name, onBlur, ref } }) => (
            <input
              id="attachments"
              name={name}
              ref={ref}
              type="file"
              multiple
              accept="application/pdf,image/*"
              onBlur={onBlur}
              onChange={(e) => onChange(Array.from(e.target.files ?? []))}
              className="text-ink-600 w-full text-sm"
            />
          )}
        />
        <p className="text-ink-400 text-[12px]">
          회사 소개서 등 자유롭게 첨부할 수 있어요. 임시 저장에는 파일이 포함되지 않고, 제안을
          보낼 때 함께 전달됩니다.
        </p>
      </Field>

      <p className="text-ink-400 text-[12px]">내 회사 정보가 제안과 함께 상대 기업에 전달됩니다.</p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={saveDraft}
          disabled={busy}
          className="shrink-0"
        >
          {isSavingDraft ? (
            <LuLoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <LuSave className="h-4 w-4" />
          )}
          임시 저장
        </Button>
        <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={busy}>
          {isSubmitting && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          제안 보내기
        </Button>
      </div>
    </form>
  );
};

// 빈 문자열 → null 정규화(액션 계약과 일치).
function normalize(values: Partial<ProposalInput>) {
  return {
    introduction: values.introduction?.trim() || null,
    interestReason: values.interestReason?.trim() || null,
    contributionCapability: values.contributionCapability?.trim() || null,
    collaborationMethod: values.collaborationMethod?.trim() || null,
    meetingAvailability: values.meetingAvailability?.trim() || null,
    contributionRole: values.contributionRole?.trim() || null,
  };
}

const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-danger text-[12px]">{error}</p>}
  </div>
);
