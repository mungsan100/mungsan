import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 저장한 글 모아보기(관리 탭) — 라운지 글/협업 공고 북마크를 각각 최신 저장순으로.
// 피드와 동일하게 삭제·운영숨김 글은 제외한다. 각 30건 캡(피드 상한과 동일한 MVP 캡).
export type SavedLoungePostView = {
  postId: string;
  title: string;
  category: DB.LoungeCategory;
  likeCount: number;
  commentCount: number;
  savedAt: Date;
};

export type SavedCollabPostView = {
  postId: string;
  title: string;
  companyName: string; // 공고 작성 기업(없으면 작성자 이름)
  applicationDeadline: Date | null;
  savedAt: Date;
};

export type SavedItemsView = {
  lounge: SavedLoungePostView[];
  collab: SavedCollabPostView[];
};

export async function getSavedItemsQuery(userId: string): Promise<SavedItemsView> {
  const [lounge, collab] = await Promise.all([
    prisma.loungeBookmark.findMany({
      where: { userId, post: { deletedAt: null, hiddenAt: null } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        createdAt: true,
        post: {
          select: { id: true, title: true, category: true, likeCount: true, commentCount: true },
        },
      },
    }),
    prisma.collaborationBookmark.findMany({
      where: { userId, post: { deletedAt: null, hiddenAt: null } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            applicationDeadline: true,
            author: { select: { name: true, company: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);

  return {
    lounge: lounge.map((bookmark) => ({
      postId: bookmark.post.id,
      title: bookmark.post.title,
      category: bookmark.post.category,
      likeCount: bookmark.post.likeCount,
      commentCount: bookmark.post.commentCount,
      savedAt: bookmark.createdAt,
    })),
    collab: collab.map((bookmark) => ({
      postId: bookmark.post.id,
      title: bookmark.post.title,
      companyName: bookmark.post.author.company?.name ?? bookmark.post.author.name,
      applicationDeadline: bookmark.post.applicationDeadline,
      savedAt: bookmark.createdAt,
    })),
  };
}
