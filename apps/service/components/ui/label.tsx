import { cn } from '@/lib/utils';

// 폼 필드 라벨.
export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('text-ink-700 text-[13px] font-semibold', className)}
      {...props}
    />
  );
}
