import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 대상의 현재 상태 — 스냅샷과 나란히 보여줘 수정·삭제·숨김 여부를 판단하게 한다.
export type ReportTargetState = 'ACTIVE' | 'HIDDEN' | 'DELETED' | 'NOT_FOUND';

export type ReportDetailView = {
  id: string;
  targetType: DB.ReportTargetType;
  targetId: string;
  reason: DB.ReportReason;
  detail: string | null;
  contentSnapshot: string;
  status: DB.ReportStatus;
  createdAt: Date;
  resolvedAt: Date | null;
  reporterName: string;
  reporterEmail: string;
  // 대상 현재 상태
  targetState: ReportTargetState;
  currentContent: string | null; // 대상이 조회 가능하면 현재 원문(숨김·삭제 포함)
  pendingCountForTarget: number; // 같은 대상의 대기 신고 수(숨김 시 일괄 처리 안내용)
};

export async function getReportDetailQuery(reportId: string): Promise<ReportDetailView | null> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      detail: true,
      contentSnapshot: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      reporter: { select: { name: true, email: true } },
    },
  });
  if (!report) return null;

  const [target, pendingCountForTarget] = await Promise.all([
    loadTarget(report.targetType, report.targetId),
    prisma.report.count({
      where: { targetType: report.targetType, targetId: report.targetId, status: 'PENDING' },
    }),
  ]);

  return {
    id: report.id,
    targetType: report.targetType,
    targetId: report.targetId,
    reason: report.reason,
    detail: report.detail,
    contentSnapshot: report.contentSnapshot,
    status: report.status,
    createdAt: report.createdAt,
    resolvedAt: report.resolvedAt,
    reporterName: report.reporter.name,
    reporterEmail: report.reporter.email,
    targetState: target.state,
    currentContent: target.content,
    pendingCountForTarget,
  };
}

async function loadTarget(
  targetType: DB.ReportTargetType,
  targetId: string,
): Promise<{ state: ReportTargetState; content: string | null }> {
  switch (targetType) {
    case 'LOUNGE_POST': {
      const post = await prisma.loungePost.findUnique({
        where: { id: targetId },
        select: { title: true, content: true, deletedAt: true, hiddenAt: true },
      });
      if (!post) return { state: 'NOT_FOUND', content: null };
      return { state: stateOf(post), content: `${post.title}\n\n${post.content}` };
    }
    case 'LOUNGE_COMMENT': {
      const comment = await prisma.loungeComment.findUnique({
        where: { id: targetId },
        select: { content: true, deletedAt: true, hiddenAt: true },
      });
      if (!comment) return { state: 'NOT_FOUND', content: null };
      return { state: stateOf(comment), content: comment.content };
    }
    case 'COLLABORATION_POST': {
      const post = await prisma.collaborationPost.findUnique({
        where: { id: targetId },
        select: { title: true, description: true, deletedAt: true, hiddenAt: true },
      });
      if (!post) return { state: 'NOT_FOUND', content: null };
      return { state: stateOf(post), content: `${post.title}\n\n${post.description}` };
    }
  }
}

function stateOf(row: { deletedAt: Date | null; hiddenAt: Date | null }): ReportTargetState {
  if (row.deletedAt) return 'DELETED';
  if (row.hiddenAt) return 'HIDDEN';
  return 'ACTIVE';
}
