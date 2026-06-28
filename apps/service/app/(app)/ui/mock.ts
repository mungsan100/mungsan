// 홈 화면 목 데이터 — UI 레벨 전용. DB/스키마/서버액션 없음.

// 헤더 통계 3칸 (진행 협업 / 매칭 대기 / 신뢰 지수)
export type HeaderStat = {
  number: string;
  unit: string;
  label: string;
};

export const headerStats: HeaderStat[] = [
  { number: '3', unit: '건', label: '진행 협업' },
  { number: '7', unit: '건', label: '매칭 대기' },
  { number: '92', unit: '점', label: '신뢰 지수' },
];

// AI 맞춤 사업 공고
export type FundingNotice = {
  agency: string;
  dday: string;
  title: string;
  amount: string;
  matchRate: string;
};

export const fundingNotices: FundingNotice[] = [
  {
    agency: '중소벤처기업부',
    dday: 'D-8',
    title: '2026 스타트업 상생 협력 바우처',
    amount: '최대 5,000만원',
    matchRate: '97%',
  },
  {
    agency: '서울경제진흥원',
    dday: 'D-14',
    title: 'AI·데이터 기반 서비스 실증 지원사업',
    amount: '최대 3,000만원',
    matchRate: '91%',
  },
  {
    agency: '정보통신산업진흥원',
    dday: 'D-21',
    title: 'B2B SaaS 글로벌 진출 패키지',
    amount: '최대 8,000만원',
    matchRate: '85%',
  },
];

// 진행 현황 요약
export type ProjectStatus = 'delayed' | 'normal' | 'urgent';

export type ProjectProgress = {
  title: string;
  stage: string;
  status: ProjectStatus;
  statusLabel: string;
  description: string;
  percent: number;
};

export const projects: ProjectProgress[] = [
  {
    title: '테크브릿지 × SynC',
    stage: '계약 협의 단계',
    status: 'delayed',
    statusLabel: '검토 지연',
    description: '파트너사 법무팀 검토 중',
    percent: 65,
  },
  {
    title: '그린랩스 공동사업',
    stage: '실행 단계',
    status: 'normal',
    statusLabel: '정상 진행',
    description: '마일스톤 2/3 완료',
    percent: 82,
  },
  {
    title: '루나소프트 API 연동',
    stage: '기획 검토 단계',
    status: 'urgent',
    statusLabel: '즉시 조치 필요',
    description: '기술 스펙 미합의',
    percent: 28,
  },
];

// 의사결정 알림
export type DecisionIcon = 'file' | 'trend' | 'check';
export type DecisionTone = 'danger' | 'warning' | 'success';

export type DecisionAlert = {
  icon: DecisionIcon;
  tone: DecisionTone;
  urgent?: boolean;
  title: string;
  subtitle: string;
};

export const decisions: DecisionAlert[] = [
  {
    icon: 'file',
    tone: 'danger',
    urgent: true,
    title: '파트너사의 기획안 검토가 필요합니다',
    subtitle: '테크브릿지 · 2시간 전',
  },
  {
    icon: 'trend',
    tone: 'warning',
    title: '이번 주 정산 서류 제출 마감 D-2',
    subtitle: '그린랩스 프로젝트 · 오늘',
  },
  {
    icon: 'check',
    tone: 'success',
    title: '루나소프트 미팅 일정이 확정되었습니다',
    subtitle: '4월 18일 오후 3시 · 화상회의',
  },
];
