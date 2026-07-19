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
  hiddenForOthers: boolean; // 운영 숨김 글을 작성자 본인이 보는 중(안내 배너용)
  isOwnPost: boolean; // 현재 유저가 작성자인지 → 신고 대신 삭제 버튼 노출
};

export type LoungePostDetailQuery = { postId: string; userId: string };

export async function getLoungePostDetailQuery({
  postId,
  userId,
}: LoungePostDetailQuery): Promise<LoungePostDetail | null> {
  // 운영 숨김(hiddenAt) 글은 타인에겐 없는 글이지만, 작성자 본인에게는 숨김 사실을
  // 안내하며 열람을 허용한다 — 본인 글이 소리 없이 사라지면 오류로 오인하고,
  // 사유 확인·이의 제기(운영팀 문의)의 근거 화면이 필요하기 때문.
  const post = await prisma.loungePost.findFirst({
    where: {
      id: postId,
      deletedAt: null,
      OR: [{ hiddenAt: null }, { authorId: userId }],
    },
    select: {
      id: true,
      createdAt: true,
      category: true,
      title: true,
      content: true,
      likeCount: true,
      commentCount: true,
      bookmarkCount: true,
      hiddenAt: true,
      authorId: true,
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
    hiddenForOthers: post.hiddenAt != null,
    isOwnPost: post.authorId === userId,
  };
}
