/**
 * 히어로 배경 애니메이션.
 *
 * 컨셉: 흩어져 있던 노드(기업) 4개가 서서히 모이고, 모였을 때 연결선(신뢰)이
 * 떠오른다. Resend의 3D 큐브에서 가져온 것은 "복잡한 개념을 오브젝트 하나로
 * 압축해 보여준다"는 아이디어뿐이고, 구현은 정반대로 갔다 —
 * 영상·WebGL·3D 라이브러리 없이 인라인 SVG + CSS 애니메이션만 쓴다.
 * 추가 네트워크 요청 0건, 추가 의존성 0개.
 *
 * 좌표계는 600x400 viewBox이며, 각 노드의 cx/cy는 '모였을 때' 위치다.
 * 흩어진 위치는 globals.css의 keyframes가 translate로 만든다.
 */

/* 모였을 때의 노드 좌표 — 선(line)의 끝점과 반드시 같은 값을 쓴다. */
const NODES = [
  { id: 'a', cx: 250, cy: 158, r: 9 },
  { id: 'b', cx: 352, cy: 150, r: 7 },
  { id: 'c', cx: 268, cy: 256, r: 7 },
  { id: 'd', cx: 366, cy: 246, r: 8 },
] as const;

/* 연결선 — 노드 좌표를 참조해 그린다. */
const LINKS: [string, string][] = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'd'],
  ['c', 'd'],
  ['a', 'd'],
];

const at = (id: string) => NODES.find((n) => n.id === id)!;

export default function HeroBackdrop() {
  return (
    <div
      aria-hidden
      // 장식 요소 — 클릭을 가로채지 않고, 모바일(sm 미만)에서는 아예 렌더 비용을 없앤다.
      className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex"
    >
      <svg
        viewBox="0 0 600 400"
        className="h-full w-full max-w-3xl opacity-70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 노드 주변의 은은한 후광 */}
          <radialGradient id="hero-halo">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 연결선: 노드가 모두 모이는 순간에만 진해진다 */}
        <g stroke="#15803d" strokeWidth="1.25" strokeLinecap="round">
          {LINKS.map(([from, to]) => {
            const a = at(from);
            const b = at(to);
            return (
              <line
                key={`${from}${to}`}
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                className="hero-link"
              />
            );
          })}
        </g>

        {/* 노드 */}
        {NODES.map(({ id, cx, cy, r }) => (
          <g key={id} className={`hero-node hero-node-${id}`}>
            <circle cx={cx} cy={cy} r={r * 4.5} fill="url(#hero-halo)" />
            <circle cx={cx} cy={cy} r={r} fill="#16a34a" fillOpacity="0.85" />
            <circle cx={cx} cy={cy} r={r + 5} stroke="#16a34a" strokeOpacity="0.25" />
          </g>
        ))}
      </svg>
    </div>
  );
}
