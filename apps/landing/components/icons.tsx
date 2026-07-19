/** 랜딩페이지 전용 라인 아이콘. 외부 아이콘 패키지 의존 없이 인라인 SVG로 둔다. */

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-6 w-6'}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* 규모 부족 */
export const IconScale = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 20V10M9 20V4M15 20v-7M21 20V8" />
  </Svg>
);

/* 신뢰 부족 */
export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

/* 네트워크 부족 */
export const IconNetwork = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="5" cy="18" r="2.5" />
    <circle cx="19" cy="18" r="2.5" />
    <path d="M12 7.5 6.5 15.8M12 7.5l5.5 8.3M7.5 18h9" />
  </Svg>
);

/* 협업 리스크 */
export const IconRisk = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4 2.5 20h19z" />
    <path d="M12 10v4M12 17.5h.01" />
  </Svg>
);

/* 데이터 부족 */
export const IconData = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="6" rx="7.5" ry="3" />
    <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
    <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
  </Svg>
);

/* 실행 관리 부족 — 체크리스트 */
export const IconChecklist = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="3.5" width="16" height="17" rx="2" />
    <path d="m7.5 9 1.5 1.5L12 7.5M7.5 15.5 9 17l3-3" />
    <path d="M15 10h2.5M15 16h2.5" />
  </Svg>
);

/* 비교표 — X */
export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

/* 비교표 — 체크 */
export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
);

/* 임원 라운지 */
export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IconMask = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8.5c0-1.4 1.2-2.5 2.6-2.5h12.8C19.8 6 21 7.1 21 8.5c0 5.2-3 9.5-6.4 9.5-1.1 0-1.8-.8-2.6-.8s-1.5.8-2.6.8C6 18 3 13.7 3 8.5Z" />
    <path d="M8 11h1.5M14.5 11H16" />
  </Svg>
);

export const IconChat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5h16v11H8l-4 3.5z" />
    <path d="M8 9h8M8 12.5h5" />
  </Svg>
);

/* 마켓플레이스 */
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Svg>
);

export const IconGauge = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="m12 14 4-4" />
  </Svg>
);

export const IconSend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-8-8-4z" />
  </Svg>
);

export const IconBookmark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-6-4.5L6 21z" />
  </Svg>
);

/* My 셰르파 */
export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16.5 6.5a3 3 0 0 1 0 5.5M17 14.5c2 .7 3.5 2.4 3.5 4.5" />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);

export const IconProgress = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5H12z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconReceipt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-3-1.8-3 1.8-3-1.8L6 21z" />
    <path d="M9.5 8h5M9.5 12h5" />
  </Svg>
);

/* 데이터 기반 분석 */
export const IconProfile = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4" width="17" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M5.5 17c.5-2 1.8-3 3.5-3s3 1 3.5 3M15 9h3M15 13h3" />
  </Svg>
);

export const IconClipboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="4.5" width="14" height="16" rx="2" />
    <path d="M9 4.5V3h6v1.5M9 10h6M9 14h4" />
  </Svg>
);

export const IconHistory = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3.5 4.5V10H9" />
    <path d="M12 8v4.5l3 1.8" />
  </Svg>
);

export const IconScore = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" />
  </Svg>
);

export const IconBulb = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 17h6M10 20.5h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3Z" />
  </Svg>
);

/* 리스크 신호 탐지 — 레이더 */
export const IconRadar = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 12 18 6" />
    <path d="M12 12v-8.5" opacity="0.45" />
  </Svg>
);

/* 베타 혜택 */
export const IconTicket = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 8.5V6h17v2.5a2.5 2.5 0 0 0 0 7V18h-17v-2.5a2.5 2.5 0 0 0 0-7Z" />
    <path d="M12 6v12" strokeDasharray="2 2.5" />
  </Svg>
);

export const IconCoin = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.5 9.5c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 1.9s1 1.5 2.5 1.8 2.5.7 2.5 1.8-1.1 1.9-2.5 1.9c-1 0-1.9-.4-2.5-1.2M12 7v10" />
  </Svg>
);
