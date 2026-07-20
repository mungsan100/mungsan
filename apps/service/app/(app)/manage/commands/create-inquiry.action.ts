'use server';

import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateInquiryCommand = { title: string; content: string };

const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

// 문의 접수(2026-07-20, 3-1) — 로그인 회원이 제목·내용으로 접수한다. admin "문의 관리"에서 확인.
export async function createInquiryAction(cmd: CreateInquiryCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  const title = cmd.title.trim();
  const content = cmd.content.trim();
  if (title.length < 2) return { ok: false, field: 'title', message: '제목을 2자 이상 입력해 주세요.' };
  if (title.length > TITLE_MAX)
    return { ok: false, field: 'title', message: `제목은 ${TITLE_MAX}자 이내로 입력해 주세요.` };
  if (content.length < 5)
    return { ok: false, field: 'content', message: '문의 내용을 5자 이상 입력해 주세요.' };
  if (content.length > CONTENT_MAX)
    return { ok: false, field: 'content', message: `내용은 ${CONTENT_MAX}자 이내로 입력해 주세요.` };

  await prisma.inquiry.create({ data: { title, content, authorId: user.id } });
  return { ok: true, data: undefined, message: '문의가 접수되었습니다. 확인 후 이메일로 답변드리겠습니다.' };
}
