'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ensureLoungeProfile } from '@/lib/lounge/ensure-lounge-profile';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateLoungeCommentCommand = {
  postId: string;
  content: string;
  parentId?: string;
};

export async function createLoungeCommentAction(
  cmd: CreateLoungeCommentCommand,
): Promise<ActionResult> {
  const user = await getCurrentUser();

  const content = cmd.content.trim();
  if (!content) return { ok: false, field: 'content', message: '댓글 내용을 입력해 주세요.' };

  const post = await prisma.loungePost.findFirst({
    where: { id: cmd.postId, deletedAt: null },
    select: { id: true },
  });
  if (!post) return { ok: false, code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' };

  if (cmd.parentId) {
    const parent = await prisma.loungeComment.findFirst({
      where: { id: cmd.parentId, postId: cmd.postId, deletedAt: null },
      select: { id: true },
    });
    if (!parent) return { ok: false, code: 'NOT_FOUND', message: '원 댓글을 찾을 수 없습니다.' };
  }

  // 댓글 작성도 라운지 표시 주체가 필요하다 — 없으면 여기서도 생성한다(글쓰기와 동일).
  await ensureLoungeProfile(user.id);

  await prisma.$transaction([
    prisma.loungeComment.create({
      data: {
        postId: cmd.postId,
        content,
        authorId: user.id,
        parentId: cmd.parentId ?? null,
      },
    }),
    prisma.loungePost.update({
      where: { id: cmd.postId },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  revalidatePath(`/lounge/${cmd.postId}`);
  revalidatePath('/lounge');
  return { ok: true, data: undefined, message: '댓글을 등록했습니다.' };
}
