'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { createLoungeCommentAction } from '../../commands/create-lounge-comment.action';

const schema = z.object({
  content: z.string().trim().min(1, '댓글 내용을 입력해 주세요.'),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface CommentFormProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onDone?: () => void;
}

// 댓글/답글 공용 폼 — parentId 유무로 최상위 댓글과 답글을 겸한다.
export const CommentForm = ({ postId, parentId, placeholder, onDone }: CommentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { content: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createLoungeCommentAction({ postId, parentId, content: values.content });
    if (!result.ok) {
      if (result.field === 'content') setError('content', { message: result.message });
      else toast.error(result.message);
      return;
    }
    reset();
    onDone?.();
    toast.success(result.message);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        {...register('content')}
        placeholder={placeholder ?? '댓글을 입력해 주세요.'}
        className="min-h-20"
      />
      {errors.content && <p className="text-danger text-xs">{errors.content.message}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          등록
        </Button>
      </div>
    </form>
  );
};
