'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { callAction } from '@/lib/forms/call-action';

import { createProposalAction } from '../../commands/create-proposal.action';

const proposalSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, '제안 메시지를 10자 이상 입력해주세요.')
    .max(2000, '제안 메시지는 2000자 이내로 입력해주세요.'),
  contributionRole: z.string().trim().max(100, '기여 역할은 100자 이내로 입력해주세요.').optional(),
});
type ProposalInput = z.input<typeof proposalSchema>;
type ProposalOutput = z.output<typeof proposalSchema>;

interface ProposalFormProps {
  postId: string;
}

export const ProposalForm = ({ postId }: ProposalFormProps) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProposalInput, unknown, ProposalOutput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { message: '', contributionRole: '' },
  });

  async function onSubmit(values: ProposalOutput) {
    const res = await callAction(
      () =>
        createProposalAction({
          postId,
          message: values.message,
          contributionRole: values.contributionRole || undefined,
        }),
      '제안 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    if (res === null) return;
    if (!res.ok) {
      if (res.field === 'message') setError('message', { message: res.message });
      else toast.error(res.message);
      return;
    }
    toast.success(res.message);
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <div className="space-y-1.5">
        <Label htmlFor="message">제안 메시지</Label>
        <Textarea
          id="message"
          placeholder="협업 목적, 기여할 수 있는 부분, 기대 효과를 적어주세요."
          {...register('message')}
        />
        {errors.message && <p className="text-danger text-[12px]">{errors.message.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contributionRole">기여 역할 (선택)</Label>
        <Input
          id="contributionRole"
          placeholder="예: SI 구축, B2B 영업, 기획 운영"
          {...register('contributionRole')}
        />
        {errors.contributionRole && (
          <p className="text-danger text-[12px]">{errors.contributionRole.message}</p>
        )}
      </div>
      <p className="text-ink-400 text-[12px]">
        내 회사 정보와 회사 소개서(등록된 경우)가 제안과 함께 상대 기업에 전달됩니다.
      </p>
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
        제안 보내기
      </Button>
    </form>
  );
};
