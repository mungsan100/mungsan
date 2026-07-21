'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import { putFile } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateBusinessCardCommand = {
  imageDataUrl: string; // 클라에서 압축한 data URL(image/jpeg 등)
  name: string;
  company: string;
  jobTitle: string;
  phone: string;
  email: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB(파일 패키지 기본 한도와 동일)

// 명함 저장(2026-07-21) — 원본 이미지를 PRIVATE blob 에 올리고, 회원이 확정한 5필드와 함께 저장.
// 5필드는 전부 선택(빈 값 허용) — 최소한 이미지만 있어도 저장된다. 소유자 = 현재 로그인 회원.
export async function createBusinessCardAction(
  cmd: CreateBusinessCardCommand,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();

  const match = /^data:(image\/\w+);base64,(.+)$/.exec(cmd.imageDataUrl ?? '');
  if (!match) return { ok: false, field: 'image', message: '명함 이미지를 다시 선택해 주세요.' };
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0)
    return { ok: false, field: 'image', message: '명함 이미지를 다시 선택해 주세요.' };
  if (buffer.length > MAX_IMAGE_BYTES)
    return { ok: false, field: 'image', message: '이미지 용량이 너무 큽니다(최대 5MB).' };

  const ext = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
  const pathname = `business-cards/${randomUUID()}.${ext}`;
  const trim = (v: string) => (typeof v === 'string' ? v.trim() : '') || null;

  // 이미지 먼저 업로드 → row 생성. row 생성 실패 시 업로드된 blob 은 정리한다(고아 방지).
  await putFile(pathname, buffer, { access: 'private', contentType });
  try {
    const card = await prisma.businessCard.create({
      data: {
        ownerId: user.id,
        name: trim(cmd.name),
        company: trim(cmd.company),
        jobTitle: trim(cmd.jobTitle),
        phone: trim(cmd.phone),
        email: trim(cmd.email),
        imagePathname: pathname,
      },
      select: { id: true },
    });
    revalidatePath('/manage');
    return { ok: true, data: { id: card.id }, message: '명함을 저장했습니다.' };
  } catch (err) {
    const { deleteFile } = await import('@mungsan/file/server');
    await deleteFile(pathname).catch(() => {});
    throw err;
  }
}
