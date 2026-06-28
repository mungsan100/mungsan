// 협업 마켓플레이스 — UI 목 데이터(타입 + 배열). DB/스키마/서버액션 없음.

export type MatchBadge = {
  label: string;
  tone: 'amber' | 'green';
};

export type NeededPartners = {
  roles: string;
  duration: string;
};

export type Partner = {
  id: string;
  initial: string;
  /** 아바타 틴트 색 — 카드마다 다른 색(Tailwind 유틸 override) */
  avatarClass: string;
  name: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  industry: string;
  location: string;
  years: string;
  headcount: string;
  /** 설명 문단(카드 1은 2문단, 나머지는 1문단) */
  descriptions: string[];
  neededPartners?: NeededPartners;
  tags: string[];
  revenue: string;
  winRate: number;
  winRateNote: string;
  /** 승률 박스 톤 — 최우선 추천(card1)만 그린, 나머지 일반 리스팅은 앰버 */
  winRateTone: 'green' | 'amber';
  matchBadge: MatchBadge;
};

export const partners: Partner[] = [
  {
    id: 'nextai',
    initial: 'N',
    avatarClass: 'bg-blue-50 text-blue-600',
    name: '넥스트에이아이',
    verified: true,
    rating: 4.8,
    reviewCount: 24,
    industry: 'AI/ML · SaaS',
    location: '서울 강남',
    years: '업력 4년',
    headcount: '32명',
    descriptions: [
      'B2B 기업 대상 AI 자동화 솔루션 전문. 주요 고객사 SK, LG, 삼성SDI.',
      '공공기관·중견기업 대상 AI 자동화 솔루션을 확장하기 위해 기획·영업·현장 운영 역량을 가진 파트너사를 찾고 있습니다.',
    ],
    neededPartners: {
      roles: '기획 운영사 · B2B 영업사 · SI 구축 파트너',
      duration: '예상 기간 3개월',
    },
    tags: ['LLM', '기업용AI', 'API'],
    revenue: '연매출 28억',
    winRate: 91,
    winRateNote: '정부 인증 추가 시 +8점',
    winRateTone: 'green',
    matchBadge: { label: '개발 보완 가능', tone: 'amber' },
  },
  {
    id: 'blueocean',
    initial: 'B',
    avatarClass: 'bg-emerald-50 text-emerald-600',
    name: '블루오션코퍼레이션',
    verified: true,
    rating: 4.6,
    reviewCount: 38,
    industry: '커머스 · 물류',
    location: '경기 판교',
    years: '업력 6년',
    headcount: '87명',
    descriptions: ['동남아 8개국 물류 네트워크 보유. 연간 처리량 120만 건 이상.'],
    tags: ['D2C', '풀필먼트', '글로벌'],
    revenue: '연매출 95억',
    winRate: 87,
    winRateNote: '요건 충족률 95%',
    winRateTone: 'amber',
    matchBadge: { label: '매칭 적합', tone: 'green' },
  },
  {
    id: 'mediinno',
    initial: 'M',
    avatarClass: 'bg-purple-50 text-purple-600',
    name: '메디이노베이션',
    verified: true,
    rating: 4.5,
    reviewCount: 17,
    industry: '헬스케어 · 데이터',
    location: '서울 마포',
    years: '업력 3년',
    headcount: '21명',
    descriptions: ['병원 EMR 데이터 기반 예측 모델 보유. 국내 30개 병원 납품 레퍼런스.'],
    tags: ['의료AI', 'EMR', '연구'],
    revenue: '연매출 14억',
    winRate: 78,
    winRateNote: '임상 인허가 파트너 필요',
    winRateTone: 'amber',
    matchBadge: { label: '기술 보완 검토', tone: 'amber' },
  },
  {
    id: 'finlight',
    initial: 'F',
    avatarClass: 'bg-amber-50 text-amber-600',
    name: '핀라이트솔루션',
    verified: true,
    rating: 4.7,
    reviewCount: 31,
    industry: '핀테크 · 보험',
    location: '서울 여의도',
    years: '업력 5년',
    headcount: '54명',
    descriptions: ['소액 보험 및 임베디드 금융 전문. 금융위 혁신금융서비스 지정 기업.'],
    tags: ['보험테크', 'PG', '정산'],
    revenue: '연매출 42억',
    winRate: 83,
    winRateNote: '라이선스 검토 필요',
    winRateTone: 'amber',
    matchBadge: { label: '조건부 적합', tone: 'amber' },
  },
];
