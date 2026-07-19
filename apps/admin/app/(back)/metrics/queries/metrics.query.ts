import 'server-only';

import { prisma } from '@mungsan/db';

// 지표 대시보드(P1) — 상단 요약 + 주간(KST, 월요일 시작) 추이 4종(가입·공고·제안·신고).
// 규모가 작아 raw GROUP BY 대신 기간 내 createdAt 을 가져와 JS 로 주별 버킷팅한다.
const WEEKS = 8;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type WeeklyRow = {
  weekStart: Date; // 주 시작(월요일 00:00 KST)의 UTC 시각
  label: string; // "M.D~" (KST)
  signups: number;
  collabPosts: number;
  proposals: number; // 제출된 것만(DRAFT 제외)
  reports: number;
};

export type MetricsSummary = {
  totalMembers: number; // 탈퇴·삭제 제외
  activeCollabPosts: number; // 공개·미삭제·미숨김
  totalProposals: number; // 누적 제출(DRAFT 제외)
  pendingReports: number; // 처리 대기 신고
};

// 주어진 시각이 속한 KST 주(월요일 00:00 KST)의 시작을 UTC Date 로 반환.
function kstWeekStart(date: Date): Date {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const day = kst.getUTCDay(); // 0=일 … 6=토
  const sinceMonday = (day + 6) % 7; // 월=0
  const mondayUtcMidnight = Date.UTC(
    kst.getUTCFullYear(),
    kst.getUTCMonth(),
    kst.getUTCDate() - sinceMonday,
  );
  return new Date(mondayUtcMidnight - KST_OFFSET_MS);
}

function kstMonthDay(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return `${kst.getUTCMonth() + 1}.${kst.getUTCDate()}`;
}

export async function getWeeklyMetricsQuery(): Promise<WeeklyRow[]> {
  const thisWeekStart = kstWeekStart(new Date());
  const rangeStart = new Date(thisWeekStart.getTime() - (WEEKS - 1) * WEEK_MS);

  const [signups, collabPosts, proposals, reports] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.collaborationPost.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.collaborationProposal.findMany({
      where: { createdAt: { gte: rangeStart }, status: { not: 'DRAFT' } },
      select: { createdAt: true },
    }),
    prisma.report.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
  ]);

  const rows: WeeklyRow[] = Array.from({ length: WEEKS }, (_, i) => {
    const weekStart = new Date(rangeStart.getTime() + i * WEEK_MS);
    return {
      weekStart,
      label: `${kstMonthDay(weekStart)}~`,
      signups: 0,
      collabPosts: 0,
      proposals: 0,
      reports: 0,
    };
  });

  const bucket = (createdAt: Date): WeeklyRow | undefined => {
    const index = Math.floor((kstWeekStart(createdAt).getTime() - rangeStart.getTime()) / WEEK_MS);
    return rows[index];
  };
  for (const r of signups) bucket(r.createdAt) && bucket(r.createdAt)!.signups++;
  for (const r of collabPosts) bucket(r.createdAt) && bucket(r.createdAt)!.collabPosts++;
  for (const r of proposals) bucket(r.createdAt) && bucket(r.createdAt)!.proposals++;
  for (const r of reports) bucket(r.createdAt) && bucket(r.createdAt)!.reports++;

  return rows;
}

export async function getMetricsSummaryQuery(): Promise<MetricsSummary> {
  const [totalMembers, activeCollabPosts, totalProposals, pendingReports] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, withdrawnAt: null } }),
    prisma.collaborationPost.count({
      where: { isPublic: true, deletedAt: null, hiddenAt: null },
    }),
    prisma.collaborationProposal.count({ where: { status: { not: 'DRAFT' } } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);
  return { totalMembers, activeCollabPosts, totalProposals, pendingReports };
}
