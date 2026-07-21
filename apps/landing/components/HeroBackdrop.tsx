/**
 * 히어로 우측 애니메이션 — "대표를 위한 비즈니스 룸".
 *
 * 원자 모형처럼 좁고 긴 타원 궤도 3개가 서로 다른 각도로 교차하고, 그 위를
 * 위성(파트너사)이 돈다. 주기적으로 계 전체가 중심으로 수렴해 하나의 큰
 * 덩어리가 됐다가 다시 흩어진다 — "작은 것들이 모여 큰 것이 된다".
 *
 * 구현 메모: 궤도가 원이 아니라 납작한 타원이라 rotate로는 표현할 수 없다
 * (rotate는 궤도 자체를 돌려버려 경로가 고정되지 않는다). 그래서 CSS
 * offset-path에 타원 경로를 직접 주고 offset-distance만 0→100%로 굴린다.
 * 궤도선은 제자리에 고정되고 위성만 그 위를 따라간다.
 *
 * 영상·WebGL·3D 라이브러리 없이 CSS만 사용 — 추가 요청 0건, 의존성 0개.
 *
 * offset-path는 px 좌표라 무대 크기가 고정이어야 정확하다(SCENE=520).
 */

const SCENE = 520;
const C = SCENE / 2;

/** 각 궤도: 기울기(deg) · 타원 반지름 · 위성 크기
 *
 * 공전 속도는 지정하지 않는다 — 다섯 위성이 --hero-cycle 안에서 각자 자기
 * 궤도를 정확히 한 바퀴 돌기 때문에, 둘레가 긴 궤도일수록 저절로 빨라진다.
 * (같은 시간 ÷ 다른 거리 = 다른 속도) 덕분에 다섯이 항상 함께 나오고
 * 함께 들어간다. */
/* 위성 색 — #00704A를 기준으로 밝기만 조금씩 다른 녹색 5종.
 * [하이라이트, 본색, 그림자] 순. */
const GREENS = [
  ['#6FCCA4', '#159168', '#00553A'],
  ['#4FBC90', '#00704A', '#004128'],
  ['#8AD9B6', '#22A176', '#00694A'],
  ['#3EA97F', '#005C3E', '#00331F'],
  ['#5FC49B', '#0A845A', '#004B31'],
] as const;

/* phase: 궤도 위 어디서 출발하는지(0~1). 다섯이 같은 지점에서 출발하면
 * 위상이 잠겨 한 덩어리처럼 돌아 보이므로(속도 차이가 안 보인다) 흩어 놓는다. */
const ORBITS = [
  { rot: 0, rx: 42, ry: 118, size: 13, phase: 0 },
  { rot: 36, rx: 96, ry: 188, size: 30, phase: 0.38 },
  { rot: 74, rx: 58, ry: 244, size: 19, phase: 0.72 },
  // 가장 바깥 궤도 — 회전각(112°)에서 ry축이 거의 가로로 눕는다.
  // 그래서 ry를 키우면 가로로 길어진다(rx를 키우면 세로로 두꺼워진다).
  { rot: 112, rx: 126, ry: 292, size: 42, phase: 0.15 },
  { rot: 150, rx: 80, ry: 214, size: 24, phase: 0.57 },
] as const;

/** 위에서 시작해 한 바퀴 도는 타원 경로 */
const ellipsePath = (rx: number, ry: number) =>
  `path('M ${C},${C - ry} A ${rx},${ry} 0 1,0 ${C},${C + ry} A ${rx},${ry} 0 1,0 ${C},${C - ry}')`;

export default function HeroBackdrop() {
  return (
    <div
      aria-hidden
      // 장식 요소. lg 미만(모바일·태블릿)에서는 렌더 비용을 완전히 없앤다.
      className="pointer-events-none relative hidden select-none lg:block"
    >
      <div
        className="hero-scene relative mx-auto"
        style={{ width: SCENE, height: SCENE }}
      >
        {/* 뒤쪽 무대 조명 */}
        <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgb(230_246_239/0.95)_0%,rgb(230_246_239/0.45)_55%,transparent_72%)]" />

        {/* 수렴·확산하는 계 전체 */}
        <div className="hero-system">
          {ORBITS.map(({ rot, rx, ry, size, phase }, i) => (
            <div
              key={rot}
              className="hero-orbit"
              style={{ transform: `rotate(${rot}deg)` }}
            >
              {/* 궤도선 */}
              <div className="hero-ring" style={{ width: rx * 2, height: ry * 2 }} />
              {/* 위성 */}
              <div
                className={`hero-sat hero-sat-${i + 1}`}
                style={
                  {
                    width: size,
                    height: size,
                    offsetPath: ellipsePath(rx, ry),
                    background: `radial-gradient(circle at 32% 28%, ${GREENS[i][0]}, ${GREENS[i][1]} 55%, ${GREENS[i][2]} 100%)`,
                    // 부모 회전을 상쇄해 위성의 하이라이트 방향을 일정하게 유지
                    transform: `rotate(${-rot}deg)`,
                    // globals.css의 animation-delay가 이 값으로 출발 위치를 정한다
                    '--sat-phase': phase,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>

        {/* 중심 구 — 비즈니스 룸 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="hero-core relative h-[30%] w-[30%]">
            {/* 외곽 글로우 */}
            <div className="absolute -inset-[45%] rounded-full bg-[radial-gradient(circle,rgb(0_112_74/0.20)_0%,transparent_68%)]" />
            {/* 본체 */}
            <div
              className="relative h-full w-full rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 32% 26%, #7FD6AE 0%, #2FA97C 22%, #00704A 58%, #003D28 100%)',
                boxShadow:
                  '0 24px 60px -18px rgb(0 82 54 / 0.55), 0 0 70px -10px rgb(0 112 74 / 0.42), inset 0 -14px 30px -10px rgb(0 40 26 / 0.6)',
              }}
            >
              {/* 유리 하이라이트 */}
              <div className="absolute top-[12%] left-[16%] h-[26%] w-[32%] rounded-full bg-white/55 blur-[6px]" />
              <div className="absolute top-[26%] left-[34%] h-[8%] w-[10%] rounded-full bg-white/70 blur-[2px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
