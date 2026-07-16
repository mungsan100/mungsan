'use server';

import { prisma } from '@mungsan/db';

// 익명 조회수 증가 — 인증 불필요. 존재하지 않는 공고(P2025)는 조용히 실패 반환(치명적 아님).
// revalidate 하지 않는다: 조회수는 소프트 지표라 매 조회마다 상세를 다시 굽지 않는다.
export type ActionResult = { ok: true } | { ok: false; message: string };

export type IncrementCollabViewCommand = { postId: string };

export async function incrementCollabViewAction(
  cmd: IncrementCollabViewCommand,
): Promise<ActionResult> {
  try {
    await prisma.collaborationPost.update({
      where: { id: cmd.postId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    return { ok: false, message: '조회수를 반영하지 못했습니다.' };
  }
  return { ok: true };
}
