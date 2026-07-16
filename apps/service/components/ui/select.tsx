import { forwardRef } from 'react';
import { LuChevronDown } from 'react-icons/lu';

import { cn } from '@/lib/utils';

// 네이티브 select — Input과 동일한 보더/포커스 톤. 옵션이 적은 폼(직책·업종)이라
// 커스텀 드롭다운 없이 접근성 좋은 네이티브 엘리먼트로 충분하다.
export const Select = forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'border-ink-200 text-ink-900 focus:border-brand h-11 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-[15px] outline-none transition-colors disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <LuChevronDown className="text-ink-400 pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
    </div>
  ),
);

Select.displayName = 'Select';
