'use server';

import { prisma } from '@mungsan/db';
import { getSignedReadUrl } from '@mungsan/file/server';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type GetSignupDocumentUrlCommand = { attachmentId: string };

// 가입 심사 서류(사업자등록증 등 COMPANY 첨부)의 시간제한 서명 URL 발급 — 관리자만.
// blob 이 private-only 스토어라 열람은 항상 이 경로(서명 URL)를 거친다
// (@mungsan/file 의 "본인+운영자 인가 후 서명 URL" 열람 경로).
export async function getSignupDocumentUrlAction(
  cmd: GetSignupDocumentUrlCommand,
): Promise<ActionResult<{ url: string }>> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const attachment = await prisma.attachment.findFirst({
    where: { id: cmd.attachmentId, ownerType: 'COMPANY' },
    select: { pathname: true },
  });
  if (!attachment) return { ok: false, code: 'NOT_FOUND', message: '서류를 찾을 수 없습니다.' };

  const url = await getSignedReadUrl(attachment.pathname);
  return { ok: true, data: { url }, message: '서류 링크를 발급했습니다.' };
}
