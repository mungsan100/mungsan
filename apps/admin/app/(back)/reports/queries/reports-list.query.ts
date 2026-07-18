import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 신고 목록. canonical 값만 반환 — 라벨 매핑은 ui 가 담당.
export type ReportListView = {
  id: string;
  targetType: DB.ReportTargetType;
  reason: DB.ReportReason;
  detail: string | null;
  reporterName: string;
  createdAt: Date;
  status: DB.ReportStatus;
  resolvedAt: Date | null;
};

// pending: 대기 신고 최신순 / done: 처리 완료(숨김·반려) 최근 처리 순 50건.
export async function getReportsQuery(mode: 'pending' | 'done'): Promise<ReportListView[]> {
  const reports = await prisma.report.findMany({
    where:
      mode === 'pending'
        ? { status: 'PENDING' }
        : { status: { in: ['CONTENT_HIDDEN', 'DISMISSED'] } },
    orderBy: mode === 'pending' ? { createdAt: 'desc' } : { resolvedAt: 'desc' },
    ...(mode === 'done' && { take: 50 }),
    select: {
      id: true,
      targetType: true,
      reason: true,
      detail: true,
      createdAt: true,
      status: true,
      resolvedAt: true,
      reporter: { select: { name: true } },
    },
  });

  return reports.map((report) => ({
    id: report.id,
    targetType: report.targetType,
    reason: report.reason,
    detail: report.detail,
    reporterName: report.reporter.name,
    createdAt: report.createdAt,
    status: report.status,
    resolvedAt: report.resolvedAt,
  }));
}
