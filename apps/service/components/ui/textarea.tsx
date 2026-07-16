import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

// 멀티라인 입력 — Input과 동일 톤. ref 포워딩(RHF register 대상).
export const Textarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'border-ink-200 text-ink-900 placeholder:text-ink-400 focus:border-brand min-h-24 w-full resize-none rounded-xl border bg-white px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
