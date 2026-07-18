import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

export type LoungePostDetail = {
  id: string;
  nickname: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null;
  industryName: string | null;
  verified: boolean;
  createdAt: Date;
  category: DB.LoungeCategory;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  liked: boolean; // 현재 유저가 좋아요를 눌렀는지
  bookmarked: boolean; // 현재 유저가 북마크했는지
};

export type LoungePostDetailQuery = { postId: string; userId: string };

export async function getLoungePostDetailQuery({
  postId,
  userId,
}: LoungePostDetailQuery): Promise<LoungePostDetail | null> {
  const post = await prisma.loungePost.findFirst({
    where: { id: postId, deletedAt: null, hiddenAt: null },
    select: {
      id: true,
      createdAt: true,
      category: true,
      title: true,
      content: true,
      likeCount: true,
      commentCount: true,
      bookmarkCount: true,
      author: {
        select: {
          executiveRole: true,
          jobTitle: true,
          approvedAt: true,
          loungeProfile: { select: { nickname: true } },
          company: { select: { industry: { select: { name: true } } } },
        },
      },
      likes: { where: { userId }, select: { id: true }, take: 1 },
      bookmarks: { where: { userId }, select: { id: true }, take: 1 },
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    nickname: post.author.loungeProfile?.nickname ?? '익명',
    executiveRole: post.author.executiveRole,
    jobTitle: post.author.jobTitle,
    industryName: post.author.company?.industry.name ?? null,
    verified: post.author.approvedAt != null,
    createdAt: post.createdAt,
    category: post.category,
    title: post.title,
    content: post.content,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    bookmarkCount: post.bookmarkCount,
    liked: post.likes.length > 0,
    bookmarked: post.bookmarks.length > 0,
  };
}
