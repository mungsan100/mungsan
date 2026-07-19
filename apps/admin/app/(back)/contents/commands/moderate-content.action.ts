'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ContentTarget = 'LOUNGE_POST' | 'LOUNGE_COMMENT' | 'COLLABORATION_POST';

export type HideContentCommand = { kind: ContentTarget; contentId: string; reason: string };
export type UnhideContentCommand = { kind: ContentTarget; contentId: string };

// 콘텐츠 숨김(소프트) — 사유·처리자·시각을 기록하고, 같은 대상의 대기 신고가 있으면
// 함께 CONTENT_HIDDEN 으로 종료한다(신고 관리와 같은 정책 — 숨기면 신고 목적 달성).
// hiddenAt null 사전조건으로 중복 처리 레이스를 닫는다.
export async function hideContentAction(cmd: HideContentCommand): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const reason = cmd.reason.trim();
  if (!reason) return { ok: false, field: 'reason', message: '숨김 사유를 입력해 주세요.' };
  if (reason.length > 500)
    return { ok: false, field: 'reason', message: '사유는 500자 이내로 입력해 주세요.' };

  const hidden = await prisma.$transaction(async (tx) => {
    const updated = await updateTarget(tx, cmd.kind, {
      where: { id: cmd.contentId, hiddenAt: null },
      data: { hiddenAt: new Date(), hiddenReason: reason, hiddenByAdminId: admin.id },
    });
    if (updated === 0) return false;

    await tx.report.updateMany({
      where: { targetType: cmd.kind, targetId: cmd.contentId, status: 'PENDING' },
      data: { status: 'CONTENT_HIDDEN', resolvedAt: new Date(), resolvedByAdminId: admin.id },
    });
    return true;
  });
  if (!hidden)
    return { ok: false, code: 'ALREADY_HIDDEN', message: '이미 숨김 처리된 콘텐츠입니다.' };

  revalidatePath('/contents');
  revalidatePath('/reports');
  return { ok: true, data: undefined, message: '콘텐츠를 숨김 처리했습니다.' };
}

// 숨김 해제 — 상태·사유·처리자 기록을 함께 지운다(복원). hiddenAt not null 사전조건.
export async function unhideContentAction(cmd: UnhideContentCommand): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const restored = await prisma.$transaction(async (tx) => {
    const updated = await updateTarget(tx, cmd.kind, {
      where: { id: cmd.contentId, hiddenAt: { not: null } },
      data: { hiddenAt: null, hiddenReason: null, hiddenByAdminId: null },
    });
    return updated > 0;
  });
  if (!restored)
    return { ok: false, code: 'NOT_HIDDEN', message: '숨김 상태가 아닌 콘텐츠입니다.' };

  revalidatePath('/contents');
  return { ok: true, data: undefined, message: '숨김을 해제했습니다.' };
}

type UpdateArgs = {
  where: { id: string; hiddenAt: null | { not: null } };
  data: {
    hiddenAt: Date | null;
    hiddenReason: string | null;
    hiddenByAdminId: string | null;
  };
};

async function updateTarget(
  tx: DB.Prisma.TransactionClient,
  kind: ContentTarget,
  args: UpdateArgs,
): Promise<number> {
  switch (kind) {
    case 'LOUNGE_POST':
      return (await tx.loungePost.updateMany(args)).count;
    case 'LOUNGE_COMMENT':
      return (await tx.loungeComment.updateMany(args)).count;
    case 'COLLABORATION_POST':
      return (await tx.collaborationPost.updateMany(args)).count;
  }
}
