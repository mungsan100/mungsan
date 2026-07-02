import { LuBell } from 'react-icons/lu';

// 헤더 우측 알림벨 + 빨강 카운트 배지. 밝은 헤더용(어두운 아이콘·캔버스 링).
interface NotificationBellProps {
  count: number;
}

export const NotificationBell = ({ count }: NotificationBellProps) => {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center">
      <LuBell className="text-ink-700 h-[22px] w-[22px]" />
      {count > 0 && (
        <span className="ring-canvas absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2">
          {count}
        </span>
      )}
    </span>
  );
};
