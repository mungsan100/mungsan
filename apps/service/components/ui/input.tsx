import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

// 텍스트 입력 — 흰 배경 + 잉크 보더, 포커스 시 브랜드 그린. ref 포워딩(RHF register 대상).
export const Input = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'border-ink-200 text-ink-900 placeholder:text-ink-400 focus:border-brand h-11 w-full rounded-xl border bg-white px-4 text-[15px] outline-none transition-colors disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
