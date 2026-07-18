'use server';

import { prisma } from '@mungsan/db';
import { getSignedReadUrl } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type GetPostAttachmentUrlCommand = { attachmentId: string };

// 공고 첨부(MEMBER 등급)의 시간제한 서명 URL 발급 — 로그인·승인 회원이면 열람 가능
// ((app) 게이트가 승인 상태를 보장, 여기선 인증만 재확인). 공개 공고의 첨부만 발급한다.
export async function getPostAttachmentUrlAction(
  cmd: GetPostAttachmentUrlCommand,
): Promise<ActionResult<{ url: string }>> {
  await getCurrentUser();

  const attachment = await prisma.attachment.findFirst({
    where: { id: cmd.attachmentId, ownerType: 'COLLABORATION_POST', kind: 'POST_ATTACHMENT' },
    select: { pathname: true, ownerId: true },
  });
  if (!attachment) return { ok: false, code: 'NOT_FOUND', message: '첨부파일을 찾을 수 없습니다.' };

  // 참조 무결성은 command 레벨 검증(무FK 컨벤션) — 공고가 살아있고 공개인지 확인.
  const post = await prisma.collaborationPost.findFirst({
    where: { id: attachment.ownerId, isPublic: true, deletedAt: null, hiddenAt: null },
    select: { id: true },
  });
  if (!post) return { ok: false, code: 'NOT_FOUND', message: '공고를 찾을 수 없습니다.' };

  const url = await getSignedReadUrl(attachment.pathname);
  return { ok: true, data: { url }, message: '첨부파일 링크를 발급했습니다.' };
}
