'use server';

import { revalidatePath } from 'next/cache';
import { prisma, DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateLoungePostCommand = {
  title: string;
  content: string;
  category: DB.LoungeCategory;
};

export async function createLoungePostAction(
  cmd: CreateLoungePostCommand,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();

  const title = cmd.title.trim();
  const content = cmd.content.trim();
  if (!title) return { ok: false, field: 'title', message: '제목을 입력해 주세요.' };
  if (!content) return { ok: false, field: 'content', message: '내용을 입력해 주세요.' };
  if (!(Object.values(DB.LoungeCategory) as string[]).includes(cmd.category))
    return { ok: false, field: 'category', message: '카테고리를 선택해 주세요.' };

  // 라운지 활동 프로필이 없으면 이름을 닉네임으로 삼아 생성한다(피드/상세의 표시 주체).
  await prisma.loungeProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, nickname: user.name },
    update: {},
  });

  const post = await prisma.loungePost.create({
    data: { title, content, category: cmd.category, authorId: user.id },
    select: { id: true },
  });

  revalidatePath('/lounge');
  return { ok: true, data: { id: post.id }, message: '글을 등록했습니다.' };
}
