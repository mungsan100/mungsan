'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { updateLoungeNicknameAction } from '../commands/update-lounge-nickname.action';

const schema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

// 라운지에서 보이는 가명 설정 — 실명과 무관, 여기서 직접 정한 값만 화면에 노출된다.
export const LoungeProfileForm = ({ nickname }: { nickname: string }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { nickname },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateLoungeNicknameAction(values);
    if (!result.ok) {
      if (result.field === 'nickname') setError('nickname', { message: result.message });
      else toast.error(result.message);
      return;
    }
    toast.success(result.message);
  });

  return (
    <form onSubmit={onSubmit} className="flex items-start gap-2">
      <div className="flex-1 space-y-1">
        <Label htmlFor="nickname" className="sr-only">
          라운지 닉네임
        </Label>
        <Input id="nickname" {...register('nickname')} placeholder="라운지에서 보일 닉네임" />
        {errors.nickname && <p className="text-danger text-xs">{errors.nickname.message}</p>}
      </div>
      <Button type="submit" variant="outline" disabled={isSubmitting}>
        {isSubmitting && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
        저장
      </Button>
    </form>
  );
};
