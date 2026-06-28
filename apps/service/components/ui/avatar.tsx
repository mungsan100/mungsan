import { cn } from '@/lib/utils';

// 이니셜 아바타 — 색상·크기는 className으로(기본은 그린 톤). 목 데이터의 letter 아바타용.
interface AvatarProps {
  fallback: string;
  className?: string;
}

export function Avatar({ fallback, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'bg-brand-soft text-brand-sub02 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold',
        className,
      )}
    >
      {fallback}
    </span>
  );
}
