// 반원 신뢰지수 게이지 — CSS conic-gradient 링(SVG 미사용).
// from 270deg 기준 게이지 각 0~180deg = 좌→상→우 상반원, 나머지는 transparent로 잘라낸다.
// radial mask로 가운데를 비워 도넛(링) 형태를 만든다.
interface TrustGaugeProps {
  score: number;
  max: number;
}

export const TrustGauge = ({ score, max }: TrustGaugeProps) => {
  const fillAngle = Math.min(180, Math.max(0, (score / max) * 180));

  return (
    <div className="relative h-[80px] w-[148px] shrink-0 overflow-hidden">
      <div
        className="absolute top-0 left-0 h-[148px] w-[148px] rounded-full"
        style={{
          background: `conic-gradient(from 270deg, #166534 0deg, #16a34a ${fillAngle * 0.45}deg, #22c55e ${
            fillAngle * 0.78
          }deg, #4ade80 ${fillAngle}deg, rgba(255,255,255,0.14) ${fillAngle}deg, rgba(255,255,255,0.14) 180deg, transparent 180deg 360deg)`,
          WebkitMask: 'radial-gradient(circle at center, transparent 62%, #000 63%)',
          mask: 'radial-gradient(circle at center, transparent 62%, #000 63%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-[34px] leading-none font-bold text-white">{score}</span>
        <span className="mt-0.5 text-xs text-white/55">/ {max}</span>
      </div>
    </div>
  );
};
