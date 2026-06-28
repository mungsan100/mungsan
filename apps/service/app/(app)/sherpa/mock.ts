// My 셰르파(공유 대시보드) — UI 목 데이터. DB/스키마/서버액션 일절 없음.

export type ProjectBanner = {
  title: string;
  subtitle: string;
  status: string;
};

export const projectBanner: ProjectBanner = {
  title: '테크브릿지 × 뭉산',
  subtitle: '내부 전용 보기 · 파트너사 미공개',
  status: '진행 중',
};

export type InsightTone = 'amber' | 'forest' | 'green';
export type InsightIconKey = 'alert' | 'chart' | 'check';

export type InsightCard = {
  id: string;
  tone: InsightTone;
  icon: InsightIconKey;
  title: string;
  description: string;
  linkLabel: string;
};

export const insightCards: InsightCard[] = [
  {
    id: 'schedule',
    tone: 'amber',
    icon: 'alert',
    title: '현재 디자인 단계가 3일 앞서 있습니다',
    description: '개발 싱크를 조절하세요. 파트너사 개발팀에 일정 조정 요청을 권장합니다.',
    linkLabel: '조율 메시지 보내기',
  },
  {
    id: 'velocity',
    tone: 'forest',
    icon: 'chart',
    title: '업무 속도: 내측 118%, 파트너 92%',
    description:
      '현재 속도 차이를 유지하면 납기 준수에 문제가 없습니다. 단, API 연동 구간은 협조가 필요합니다.',
    linkLabel: '상세 분석 보기',
  },
  {
    id: 'milestone',
    tone: 'green',
    icon: 'check',
    title: '전체 마일스톤 달성률 67%',
    description: '현재 진행 속도로는 론칭 목표일인 5/20 준수가 가능합니다. 좋은 흐름입니다.',
    linkLabel: '리포트 확인',
  },
];

export type MilestoneStatus = 'done' | 'active' | 'upcoming';

export type MilestoneStep = {
  id: string;
  index: number;
  title: string;
  status: MilestoneStatus;
  ours: string;
  partner: string;
  warning?: string;
};

export const milestoneSteps: MilestoneStep[] = [
  { id: 'kickoff', index: 1, title: '프로젝트 킥오프', status: 'done', ours: '3/15', partner: '3/15' },
  { id: 'spec', index: 2, title: '요구사항 정의 & 사양서', status: 'done', ours: '3/28', partner: '3/31' },
  {
    id: 'design',
    index: 3,
    title: 'UI/UX 디자인',
    status: 'active',
    ours: '4/10',
    partner: '예정 4/18',
    warning: '디자인 단계가 3일 앞서 있습니다',
  },
  { id: 'backend', index: 4, title: '백엔드 API 개발', status: 'upcoming', ours: '진행 중', partner: '예정 4/28' },
  { id: 'qa', index: 5, title: '통합 테스트', status: 'upcoming', ours: '예정 5/10', partner: '예정 5/10' },
  { id: 'launch', index: 6, title: '론칭 & 배포', status: 'upcoming', ours: '예정 5/20', partner: '예정 5/20' },
];

export const overallProgress = 67;
