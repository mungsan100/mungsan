import { cn } from '@/lib/utils';

// 흰 카드 컨테이너 — rounded-2xl + soft shadow. 패딩은 사용처에서.
export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('shadow-card rounded-2xl bg-white', className)} {...props} />;
}
