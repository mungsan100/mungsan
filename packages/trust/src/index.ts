// 신뢰지수 파생 — 저장 모델이 아니라 실제 신호(프로필·활동·응답·협업)로 계산하는 파생값.
// service(홈·관리)와 admin(회원 상세)이 공유하는 단일 진실원(공식). 순수 함수 — I/O 없음.
//
// [2026-07-20 결정] 신원 인증 지표(이메일 10+휴대폰 10)는 인증 기능이 아직 없어 전 회원
// 0점 고정이었고, 그만큼 실질 만점이 80점이라 "신뢰 우수(85+)"에 도달할 수 없는 왜곡이
// 있었다 → 산정에서 제외하고 나머지 4지표(각 20점) 합을 100점 만점으로 환산한다.
// 이메일/휴대폰 인증 기능이 도입되면 신원 인증 지표를 복원할 것(git history 참고) —
// 그때 가입 승인(서류 심사 통과) 신호를 함께 반영하는 안도 검토.
export type TrustSignals = {
  companyFieldsFilled: number; // 채워진 회사 프로필 항목 수
  companyFieldsTotal: number; // 전체 회사 프로필 항목 수
  activityCount: number; // 라운지 글·댓글 + 협업 공고·제안 합
  receivedProposals: number; // 내 공고가 받은 제안 수(임시저장 DRAFT 제외 — 미제출은 응답 대상이 아님)
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
  score: number; // 0..100 — 지표 합(0..80)을 100점 만점으로 환산
  max: 100;
  grade: string; // 점수에서 파생한 등급 라벨
  metrics: TrustMetric[]; // 각 20점 만점 4지표
};

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));

export function computeTrustScore(s: TrustSignals): TrustScore {
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
    { key: 'profile', label: '프로필 완성도', value: profile, max: 20 },
    { key: 'activity', label: '커뮤니티 활동', value: activity, max: 20 },
    { key: 'response', label: '제안 응답률', value: response, max: 20 },
    { key: 'collaboration', label: '협업 참여', value: collaboration, max: 20 },
  ];

  const rawSum = metrics.reduce((sum, m) => sum + m.value, 0); // /80
  const rawMax = metrics.reduce((sum, m) => sum + m.max, 0);
  const score = Math.round((100 * rawSum) / rawMax); // /100 환산

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
