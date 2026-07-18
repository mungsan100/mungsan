'use server';

import { prisma } from '@mungsan/db';
import { getSignedReadUrl } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type GetProposalAttachmentUrlCommand = { attachmentId: string };

// 제안 참고 자료의 시간제한 서명 URL 발급 — 그 제안을 받은 공고 작성자와 제안자 본인만.
// blob이 private-only 스토어라 열람은 항상 이 경로(서명 URL)를 거친다.
export async function getProposalAttachmentUrlAction(
  cmd: GetProposalAttachmentUrlCommand,
): Promise<ActionResult<{ url: string }>> {
  const user = await getCurrentUser();

  const attachment = await prisma.attachment.findFirst({
    where: { id: cmd.attachmentId, ownerType: 'COLLABORATION_PROPOSAL', kind: 'PROPOSAL_ATTACHMENT' },
    select: { ownerId: true, pathname: true },
  });
  if (!attachment) return { ok: false, code: 'NOT_FOUND', message: '참고 자료를 찾을 수 없습니다.' };

  // Attachment는 무FK 폴리모픽 — 참조 무결성·인가는 command가 검증한다(컨벤션).
  const proposal = await prisma.collaborationProposal.findFirst({
    where: {
      id: attachment.ownerId,
      OR: [{ post: { authorId: user.id } }, { proposerId: user.id }],
    },
    select: { id: true },
  });
  if (!proposal) return { ok: false, code: 'NOT_FOUND', message: '참고 자료를 찾을 수 없습니다.' };

  const url = await getSignedReadUrl(attachment.pathname);
  return { ok: true, data: { url }, message: '참고 자료 링크를 발급했습니다.' };
}
