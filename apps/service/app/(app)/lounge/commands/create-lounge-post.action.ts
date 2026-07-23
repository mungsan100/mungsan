'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { classifyLoungeCategory } from '@/lib/lounge/classify-category';
import { ensureLoungeProfile } from '@/lib/lounge/ensure-lounge-profile';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

// 카테고리는 AI 자동 분류(2026-07-20, 5-3)라 작성 시 입력받지 않는다 — 저장 후 상세에서 수정 가능.
export type CreateLoungePostCommand = {
  title: string;
  content: string;
};

export async function createLoungePostAction(
  cmd: CreateLoungePostCommand,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();

  const title = cmd.title.trim();
  const content = cmd.content.trim();
  if (!title) return { ok: false, field: 'title', message: '제목을 입력해 주세요.' };
  if (!content) return { ok: false, field: 'content', message: '내용을 입력해 주세요.' };

  // 라운지 활동 프로필이 없으면 생성한다(피드/상세의 표시 주체 — 닉네임은 실명과 무관).
  await ensureLoungeProfile(user.id);

  // AI 자동 분류 — 실패·타임아웃·미설정이면 ETC 폴백(작성 흐름을 막지 않는다).
  const category = await classifyLoungeCategory(title, content);

  const post = await prisma.loungePost.create({
    data: { title, content, category, authorId: user.id },
    select: { id: true },
  });

  revalidatePath('/lounge');
  return { ok: true, data: { id: post.id }, message: '글을 등록했습니다.' };
}
