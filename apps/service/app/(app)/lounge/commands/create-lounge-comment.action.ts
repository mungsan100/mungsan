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
    where: { id: cmd.postId, deletedAt: null, hiddenAt: null },
    select: { id: true, title: true, authorId: true },
  });
  if (!post) return { ok: false, code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' };

  let parent: { id: string; authorId: string } | null = null;
  if (cmd.parentId) {
    parent = await prisma.loungeComment.findFirst({
      where: { id: cmd.parentId, postId: cmd.postId, deletedAt: null, hiddenAt: null },
      select: { id: true, authorId: true },
    });
    if (!parent) return { ok: false, code: 'NOT_FOUND', message: '원 댓글을 찾을 수 없습니다.' };
  }

  // 댓글 작성도 라운지 표시 주체가 필요하다 — 없으면 여기서도 생성한다(글쓰기와 동일).
  await ensureLoungeProfile(user.id);

  // 알림 표기는 라운지 가명 원칙대로 닉네임만 쓴다 — 실명은 절대 노출하지 않는다(6단계).
  const profile = await prisma.loungeProfile.findUnique({
    where: { userId: user.id },
    select: { nickname: true },
  });
  const nickname = profile?.nickname ?? '임원';

  // 수신자 산정 — 본인 활동엔 알림하지 않고, 답글 수신자가 글 작성자와 같으면 1건만 보낸다.
  const replyRecipientId = parent && parent.authorId !== user.id ? parent.authorId : null;
  const postRecipientId =
    post.authorId !== user.id && post.authorId !== replyRecipientId ? post.authorId : null;
  const notifications = [
    ...(replyRecipientId
      ? [
          {
            type: 'LOUNGE' as const,
            title: '내 댓글에 답글이 달렸어요',
            body: `'${post.title}' 글의 내 댓글에 ${nickname} 님이 답글을 남겼어요.`,
            linkUrl: `/lounge/${post.id}`,
            userId: replyRecipientId,
          },
        ]
      : []),
    ...(postRecipientId
      ? [
          {
            type: 'LOUNGE' as const,
            title: '내 글에 새 댓글이 달렸어요',
            body: `'${post.title}' 글에 ${nickname} 님이 댓글을 남겼어요.`,
            linkUrl: `/lounge/${post.id}`,
            userId: postRecipientId,
          },
        ]
      : []),
  ];

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
    // 댓글과 같은 트랜잭션(원자성) — 협업 제안 알림과 동일 패턴.
    ...(notifications.length > 0
      ? [prisma.notification.createMany({ data: notifications })]
      : []),
  ]);

  revalidatePath(`/lounge/${cmd.postId}`);
  revalidatePath('/lounge');
  return { ok: true, data: undefined, message: '댓글을 등록했습니다.' };
}
