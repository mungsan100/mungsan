import type { Screenshot } from '@/lib/landing-config';

type Props = {
  shot: Screenshot;
  /** 짙은 녹색 배경(9번 섹션)에 얹을 때 */
  tone?: 'light' | 'dark';
  /** 프레임 우상단에 붙는 라벨 (예: 'Beta Preview') */
  badge?: string;
};

/**
 * 아이폰 목업 프레임.
 *
 * 실제 앱(apps/service)이 480px 폭 세로형 모바일 셸이라, 스크린샷을 그대로
 * 가로 박스에 넣으면 찌그러진다. 여기서는 세로 비율 폰 프레임 안에 넣는다.
 *
 * 이미지 교체: lib/landing-config.ts 의 SCREENSHOTS 에서 src만 채우면
 * placeholder가 실제 화면으로 바뀐다 — 이 파일은 손댈 필요가 없다.
 *
 * 프레임은 전부 CSS(테두리·라운드·노치·그림자)로 그린다. 이미지 에셋 0개.
 */
export default function PhoneMockup({ shot, tone = 'light', badge }: Props) {
  const isDark = tone === 'dark';

  return (
    <div className="relative mx-auto w-full max-w-[292px]">
      {badge && (
        <span
          className={`absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
            isDark ? 'bg-white/15 text-white backdrop-blur' : 'bg-cta text-white shadow-md'
          }`}
        >
          {badge}
        </span>
      )}

      {/* 바디 — 흰색 프레임. 밝은 배경에서는 얇은 테두리로 윤곽을 잡고,
          어두운 배경(9번 섹션)에서는 흰색 자체가 대비를 만든다. */}
      <div
        className="relative rounded-[2.75rem] bg-white p-[11px]"
        style={{
          boxShadow: isDark
            ? '0 30px 70px -25px rgb(0 0 0 / 0.55)'
            : '0 34px 70px -28px rgb(15 23 42 / 0.4), 0 0 0 1px rgb(15 23 42 / 0.09)',
        }}
      >
        {/* 측면 버튼 */}
        <span className="absolute top-[104px] -left-[3px] h-11 w-[3px] rounded-l bg-ink-300" />
        <span className="absolute top-[164px] -left-[3px] h-11 w-[3px] rounded-l bg-ink-300" />
        <span className="absolute top-[128px] -right-[3px] h-16 w-[3px] rounded-r bg-ink-300" />

        {/* 화면 */}
        <div
          className="relative overflow-hidden rounded-[2.1rem] bg-ink-100"
          // 아이폰 14 비율(390 × 844)
          style={{ aspectRatio: '390 / 844' }}
        >
          {/* 노치 — 프레임과 같은 흰색이라, 위쪽 테두리가 화면 안으로
              이어져 내려온 것처럼 보인다. 스크린샷을 넣어도 그 위에 얹힌다. */}
          <div className="absolute top-0 left-1/2 z-10 h-[26px] w-[108px] -translate-x-1/2 rounded-b-[14px] bg-white" />

          {shot.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.src} alt={shot.alt} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ink-400"
                aria-hidden
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="m21 16-5-5-4.5 4.5L9 13l-6 6" />
              </svg>
              <p className="text-sm leading-relaxed font-medium text-ink-500">{shot.label}</p>
              <p className="text-xs text-ink-400">이미지 자리 — 스크린샷 교체 예정</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
