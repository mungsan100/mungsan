import 'server-only';

import { connection } from 'next/server';
import { prisma } from '@mungsan/db';

import { getSherpaProjectQuery } from './sherpa-project.query';

// primary 프로젝트의 Task 파생 분석 — 숫자만. 표시(라벨·tone)는 ui가 맡는다.
export type SherpaInsightsView = {
  progressPercentage: number;
  completedThisWeek: number; // 최근 7일 내 완료
  overdueCount: number; // 마감 지난 미완료
  dueSoonCount: number; // 향후 7일 내 마감 미완료
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getSherpaInsightsQuery(): Promise<SherpaInsightsView> {
  const project = await getSherpaProjectQuery();
  if (!project) {
    return { progressPercentage: 0, completedThisWeek: 0, overdueCount: 0, dueSoonCount: 0 };
  }

  // now를 카운트 where에 실어야 하므로 조회 직전 요청 시점으로 확정 — 동적임을 명시한다.
  await connection();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - WEEK_MS);
  const weekAhead = new Date(now.getTime() + WEEK_MS);

  const [completedThisWeek, overdueCount, dueSoonCount] = await Promise.all([
    prisma.task.count({
      where: { projectId: project.id, status: 'COMPLETED', completedAt: { gte: weekAgo } },
    }),
    prisma.task.count({
      where: { projectId: project.id, status: { not: 'COMPLETED' }, dueDate: { lt: now } },
    }),
    prisma.task.count({
      where: {
        projectId: project.id,
        status: { not: 'COMPLETED' },
        dueDate: { gte: now, lte: weekAhead },
      },
    }),
  ]);

  return {
    progressPercentage: project.progressPercentage,
    completedThisWeek,
    overdueCount,
    dueSoonCount,
  };
}
