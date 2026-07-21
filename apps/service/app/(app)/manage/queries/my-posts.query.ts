import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 내가 쓴 글 모아보기(2026-07-21) — 본인이 작성한 라운지 글 + 협업 공고.
// 삭제(deletedAt)된 건 제외, 운영 숨김(hiddenAt)은 "숨김" 표시와 함께 남겨 본인이 상태를 알게 한다.
export type MyLoungePost = {
  postId: string;
  title: string;
  category: DB.LoungeCategory;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  hidden: boolean;
};
export type MyCollabPost = {
  postId: string;
  title: string;
  createdAt: Date;
  applicationDeadline: Date | null;
  hidden: boolean;
};
export type MyPosts = { lounge: MyLoungePost[]; collab: MyCollabPost[] };

export async function getMyPostsQuery(userId: string): Promise<MyPosts> {
  const [lounge, collab] = await Promise.all([
    prisma.loungePost.findMany({
      where: { authorId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
        hiddenAt: true,
      },
    }),
    prisma.collaborationPost.findMany({
      where: { authorId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        applicationDeadline: true,
        hiddenAt: true,
      },
    }),
  ]);

  return {
    lounge: lounge.map((p) => ({
      postId: p.id,
      title: p.title,
      category: p.category,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      createdAt: p.createdAt,
      hidden: p.hiddenAt != null,
    })),
    collab: collab.map((p) => ({
      postId: p.id,
      title: p.title,
      createdAt: p.createdAt,
      applicationDeadline: p.applicationDeadline,
      hidden: p.hiddenAt != null,
    })),
  };
}
