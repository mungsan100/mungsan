// 신뢰지수 파생 — 저장 모델이 아니라 실제 신호(인증·프로필·활동·응답·협업)로 계산하는 파생값.
// 홈(단일 점수)·관리(지표 분해)가 공유하는 단일 진실원(공식). 순수 함수 — I/O 없음.

export type TrustSignals = {
  emailVerified: boolean;
  phoneVerified: boolean;
  companyFieldsFilled: number; // 채워진 회사 프로필 항목 수
  companyFieldsTotal: number; // 전체 회사 프로필 항목 수
  activityCount: number; // 라운지 글·댓글 + 협업 공고·제안 합
  receivedProposals: number; // 내 공고가 받은 제안 수
  respondedProposals: number; // 그중 응답한 수
  projectCount: number; // 참여 프로젝트 수
};

export type TrustMetric = {
  key: string;
  label: string;
  value: number; // 0..max
  max: number;
};

export type TrustScore = {
  score: number; // 0..100
  max: 100;
  grade: string; // 점수에서 파생한 등급 라벨
  metrics: TrustMetric[]; // 각 20점 만점 5지표
};

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));

export function computeTrustScore(s: TrustSignals): TrustScore {
  const verification = (s.emailVerified ? 10 : 0) + (s.phoneVerified ? 10 : 0); // /20
  const profile =
    s.companyFieldsTotal > 0
      ? Math.round((20 * s.companyFieldsFilled) / s.companyFieldsTotal)
      : 0; // /20
  const activity = clamp(s.activityCount * 2, 20); // 10건이면 만점
  const response =
    s.receivedProposals > 0
      ? Math.round((20 * s.respondedProposals) / s.receivedProposals)
      : 12; // 받은 제안이 없으면 중립값
  const collaboration = clamp(s.projectCount * 10, 20); // 2건이면 만점

  const metrics: TrustMetric[] = [
    { key: 'verification', label: '신원 인증', value: verification, max: 20 },
    { key: 'profile', label: '프로필 완성도', value: profile, max: 20 },
    { key: 'activity', label: '커뮤니티 활동', value: activity, max: 20 },
    { key: 'response', label: '제안 응답률', value: response, max: 20 },
    { key: 'collaboration', label: '협업 참여', value: collaboration, max: 20 },
  ];

  const score = metrics.reduce((sum, m) => sum + m.value, 0); // /100

  const grade =
    score >= 85
      ? '신뢰 우수'
      : score >= 70
        ? '신뢰 양호'
        : score >= 50
          ? '신뢰 보통'
          : '신뢰 관리 필요';

  return { score, max: 100, grade, metrics };
}
