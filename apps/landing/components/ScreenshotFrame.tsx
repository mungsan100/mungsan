import type { Screenshot } from '@/lib/landing-config';

type Props = {
  shot: Screenshot;
  /** 짙은 녹색 배경 섹션(9번)에서 쓰는 반전 색상 */
  tone?: 'light' | 'dark';
  /** 'Beta Preview' 같은 우상단 라벨 (8번 섹션) */
  badge?: string;
};

/**
 * 앱 스크린샷 자리.
 * lib/landing-config.ts 의 src가 null이면 회색 placeholder 박스를,
 * 경로가 채워져 있으면 실제 이미지를 같은 크기·비율로 렌더한다.
 * → 스크린샷 교체 시 이 파일은 건드릴 필요가 없다.
 */
export default function ScreenshotFrame({ shot, tone = 'light', badge }: Props) {
  const isDark = tone === 'dark';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border ${
        isDark
          ? 'border-white/15 bg-white/5'
          : 'border-ink-200 bg-ink-100 shadow-[0_20px_60px_-24px_rgb(15_23_42/0.25)]'
      }`}
      style={{ aspectRatio: shot.ratio }}
    >
      {badge && (
        <span
          className={`absolute top-4 right-4 z-10 rounded-full px-3 py-1 text-xs font-semibold ${
            isDark ? 'bg-white/15 text-white' : 'bg-white text-brand-sub01 shadow-sm'
          }`}
        >
          {badge}
        </span>
      )}

      {shot.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shot.src} alt={shot.alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={isDark ? 'text-white/40' : 'text-ink-400'}
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="m21 16-5-5-4.5 4.5L9 13l-6 6" />
          </svg>
          <p
            className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-ink-500'}`}
          >
            {shot.label}
          </p>
          <p className={`text-xs ${isDark ? 'text-white/35' : 'text-ink-400'}`}>
            이미지 자리 — 스크린샷 교체 예정
          </p>
        </div>
      )}
    </div>
  );
}
