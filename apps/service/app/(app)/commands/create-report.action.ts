'use server';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateReportCommand = {
  targetType: DB.ReportTargetType;
  targetId: string;
  reason: DB.ReportReason;
  detail: string | null; // OTHER 선택 시 직접 입력(선택)
};

const REASONS: DB.ReportReason[] = ['SPAM', 'ABUSE', 'FALSE_INFO', 'OTHER'];
const DETAIL_MAX = 500;
const SNAPSHOT_MAX = 2000;

// 신고 접수 — 라운지 글/댓글·협업 공고 공용(폴리모픽). 신고 시점 원문을 스냅샷으로 보존해
// 이후 원문이 수정·삭제·숨김돼도 심사 근거가 남는다. 같은 사용자의 같은 대상 중복 신고는
// DB unique 제약(P2002)으로 차단. 신고자에게는 접수 사실만 알리고 진행상황은 노출하지 않는다.
export async function createReportAction(cmd: CreateReportCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!REASONS.includes(cmd.reason))
    return { ok: false, code: 'INVALID_REASON', message: '올바른 신고 사유를 선택해 주세요.' };

  const detail = cmd.reason === 'OTHER' ? cmd.detail?.trim() || null : null;
  if (detail && detail.length > DETAIL_MAX)
    return { ok: false, field: 'detail', message: `신고 사유는 ${DETAIL_MAX}자 이내로 입력해 주세요.` };

  const snapshot = await loadContentSnapshot(cmd.targetType, cmd.targetId);
  if (snapshot === null)
    return { ok: false, code: 'NOT_FOUND', message: '신고할 콘텐츠를 찾을 수 없습니다.' };

  try {
    await prisma.report.create({
      data: {
        targetType: cmd.targetType,
        targetId: cmd.targetId,
        reason: cmd.reason,
        detail,
        contentSnapshot: snapshot.slice(0, SNAPSHOT_MAX),
        status: 'PENDING',
        reporterId: user.id,
      },
    });
  } catch (err) {
    // unique([reporterId, targetType, targetId]) 충돌 = 중복 신고.
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002')
      return { ok: false, code: 'ALREADY_REPORTED', message: '이미 신고한 콘텐츠입니다.' };
    throw err;
  }

  return { ok: true, data: undefined, message: '신고가 접수되었습니다.' };
}

// 대상별 신고 시점 원문 — 살아있는(미삭제·미숨김) 대상만 신고 가능. 없으면 null.
async function loadContentSnapshot(
  targetType: DB.ReportTargetType,
  targetId: string,
): Promise<string | null> {
  switch (targetType) {
    case 'LOUNGE_POST': {
      const post = await prisma.loungePost.findFirst({
        where: { id: targetId, deletedAt: null, hiddenAt: null },
        select: { title: true, content: true },
      });
      return post ? `${post.title}\n\n${post.content}` : null;
    }
    case 'LOUNGE_COMMENT': {
      const comment = await prisma.loungeComment.findFirst({
        where: { id: targetId, deletedAt: null, hiddenAt: null },
        select: { content: true },
      });
      return comment ? comment.content : null;
    }
    case 'COLLABORATION_POST': {
      const post = await prisma.collaborationPost.findFirst({
        where: { id: targetId, deletedAt: null, hiddenAt: null },
        select: { title: true, description: true },
      });
      return post ? `${post.title}\n\n${post.description}` : null;
    }
  }
}
