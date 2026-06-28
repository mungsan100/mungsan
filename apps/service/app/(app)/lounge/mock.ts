// 라운지 화면 목 데이터 — UI 레벨 전용. DB/스키마/서버액션 없음.

export type LoungeCategory =
  | '전체'
  | 'IT/SaaS'
  | '커머스'
  | '제조업'
  | '헬스케어'
  | '핀테크';

export const loungeCategories: LoungeCategory[] = [
  '전체',
  'IT/SaaS',
  '커머스',
  '제조업',
  '헬스케어',
  '핀테크',
];

// 실시간 트렌드 — 우측 배지 톤(success=상승률 그린, warning=마감 임박 앰버).
export type TrendTone = 'success' | 'warning';

export type TrendItem = {
  rank: number;
  title: string;
  badgeLabel: string;
  badgeTone: TrendTone;
};

export const trendItems: TrendItem[] = [
  { rank: 1, title: 'AI 에이전트 공동개발 수요 급증', badgeLabel: '+128%', badgeTone: 'success' },
  { rank: 2, title: '정부 상생협력 바우처 마감 임박', badgeLabel: 'D-8', badgeTone: 'warning' },
  { rank: 3, title: 'B2B SaaS 해외 파트너십 기회', badgeLabel: '+47%', badgeTone: 'success' },
];

// 게시글 — 작성자 메타(인증·매출 티어·역할·시각) + 카테고리 해시태그 + 본문 미리보기 + 반응 카운트.
export type LoungePost = {
  id: string;
  authorName: string;
  authorInitial: string;
  verified: boolean;
  revenue: string;
  role: string;
  postedAt: string;
  hot: boolean;
  category: string;
  title: string;
  preview: string;
  likes: number;
  comments: number;
  bookmarks: number;
};

export const loungePosts: LoungePost[] = [
  {
    id: 'post-1',
    authorName: '테크사업가K',
    authorInitial: '테',
    verified: true,
    revenue: '매출 50억+',
    role: 'CEO',
    postedAt: '23분 전',
    hot: true,
    category: 'IT/SaaS',
    title: 'SaaS B2B 영업, 파트너사 초기 신뢰 구축 어떻게 하셨나요?',
    preview:
      '저도 초기에 엔터프라이즈 영업 시 신뢰 레퍼런스가 없어서 많이 힘들었는데, 대표님들은 어떤 방식으로 첫 거래를 성사시키셨나요? SynC 워크보드 공유 방식이 효과적이더라고요.',
    likes: 47,
    comments: 23,
    bookmarks: 18,
  },
  {
    id: 'post-2',
    authorName: '그로스해커J',
    authorInitial: '그',
    verified: true,
    revenue: '매출 10억~50억',
    role: 'COO',
    postedAt: '1시간 전',
    hot: true,
    category: '커머스',
    title: '[트렌드] 2026 리테일테크 협업 트렌드 - 데이터 공유형 파트너십의 부상',
    preview:
      '최근 오프라인 리테일 기업들이 데이터 기반의 협업 파트너를 적극적으로 찾고 있습니다. 특히 실시간 인벤토리 공유와 고객 데이터 동기화 역량을 가진 스타트업에 대한 수요가...',
    likes: 89,
    comments: 41,
    bookmarks: 67,
  },
  {
    id: 'post-3',
    authorName: '바이오이노베이터P',
    authorInitial: '바',
    verified: true,
    revenue: '매출 100억+',
    role: 'CTO',
    postedAt: '3시간 전',
    hot: false,
    category: '헬스케어',
    title: '헬스케어 × AI 분야 공동연구 파트너 찾습니다 (R&D 비용 분담)',
    preview:
      '의료 데이터 AI 분석 분야에서 협업할 파트너를 찾고 있습니다. 자체 병원 네트워크와 익명화된 데이터셋 보유 중이며, AI/ML 역량을 가진 팀과의 공동 연구를 원합니다.',
    likes: 35,
    comments: 12,
    bookmarks: 29,
  },
  {
    id: 'post-4',
    authorName: '핀테크파운더M',
    authorInitial: '핀',
    verified: true,
    revenue: '매출 10억~50억',
    role: 'CEO',
    postedAt: '5시간 전',
    hot: false,
    category: '핀테크',
    title: '투자사 선정 기준 변화 체감하시나요? 최근 Due Diligence 트렌드',
    preview:
      '작년 대비 투자사들의 협업 생태계 심사 비중이 크게 높아진 것 같습니다. 파트너십 이력과 공동사업 실적을 특히 중요하게 보는 추세인데 대표님들 생각은 어떤가요?',
    likes: 61,
    comments: 34,
    bookmarks: 45,
  },
];
