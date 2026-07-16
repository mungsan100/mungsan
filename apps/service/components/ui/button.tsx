import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // 깊은 그린 그라데이션 — "제안하기" 류 주요 액션
        primary: 'from-brand-sub01 to-brand-deep bg-gradient-to-b text-white',
        brand: 'bg-brand text-white hover:bg-brand-sub01',
        outline: 'border-ink-200 text-ink-700 hover:bg-ink-50 border bg-white',
        ghost: 'text-ink-600 hover:bg-ink-100',
        soft: 'bg-brand-soft text-brand-sub02',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-11 px-5 text-[15px]',
        lg: 'h-13 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'brand', size: 'md' },
  },
);

interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
