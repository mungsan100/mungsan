// 매칭률 원형 게이지 — 데이터 시각화 SVG(아이콘 아님). value 0~100, 높으면 브랜드 그린·아니면 경고색.
interface MatchRingProps {
  value: number;
}

export const MatchRing = ({ value }: MatchRingProps) => {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  const color = pct >= 85 ? 'var(--color-brand)' : 'var(--color-warning)';

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--color-ink-100)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <span className="text-ink-900 absolute inset-0 flex items-center justify-center text-[13px] font-bold">
        {pct}%
      </span>
    </div>
  );
};
