import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-brand-soft text-brand-sub02',
        success: 'bg-emerald-50 text-emerald-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-red-50 text-red-500',
        secondary: 'bg-ink-100 text-ink-500',
        outline: 'border border-ink-200 text-ink-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'sm' },
  },
);

interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
