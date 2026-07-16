'use client';

import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { LuCheck } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// 약관 동의 체크박스 — radix Checkbox(접근성) + Input과 통일된 보더 톤.
export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'border-ink-200 data-[state=checked]:bg-brand data-[state=checked]:border-brand flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-white outline-none transition-colors disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        <LuCheck className="h-3.5 w-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
