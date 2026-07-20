'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; message: string };

const NOTE_MAX = 1000;

// 문의 처리 완료(2026-07-20) — 대기(resolvedAt null) 건만. 처리 메모는 선택.
// 사전조건을 where 에 실은 updateMany 로 중복 처리 레이스를 DB 에서 닫는다.
export async function resolveInquiryAction(cmd: {
  inquiryId: string;
  note?: string;
}): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const note = cmd.note?.trim() ?? '';
  if (note.length > NOTE_MAX)
    return { ok: false, code: 'NOTE_TOO_LONG', message: `처리 메모는 ${NOTE_MAX}자 이내로 입력해 주세요.` };

  const updated = await prisma.inquiry.updateMany({
    where: { id: cmd.inquiryId, resolvedAt: null },
    data: {
      resolvedAt: new Date(),
      resolvedByAdminId: admin.id,
      adminNote: note.length > 0 ? note : null,
    },
  });
  if (updated.count === 0)
    return { ok: false, code: 'NOT_RESOLVABLE', message: '이미 처리됐거나 없는 문의입니다.' };

  revalidatePath('/inquiries');
  return { ok: true, data: undefined, message: '문의를 처리 완료로 표시했습니다.' };
}
