import type { HeaderStat } from './mock';

// 헤더 하단 통계 3칸 — 반투명/화이트 보더 셀, 숫자 크게 흰색 + 라벨 작게 흰색70%.
interface HeaderStatsProps {
  stats: HeaderStat[];
}

export const HeaderStats = ({ stats }: HeaderStatsProps) => {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/15 bg-white/10 px-2 py-3.5 text-center"
        >
          <p className="text-white">
            <span className="text-[22px] font-bold">{stat.number}</span>
            <span className="ml-0.5 text-[14px] font-semibold">{stat.unit}</span>
          </p>
          <p className="mt-1 text-[12px] text-white/65">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
