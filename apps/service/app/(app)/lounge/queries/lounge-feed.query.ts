import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

// 좋아요+댓글 합이 이 값 이상이면 HOT. 실데이터가 없어 임의 기준 — 추후 정책화 대상.
// [파생·근거없음] hot 자체가 DB 필드가 아니라 반응 카운트로 유도한 표시 신호다.
const HOT_THRESHOLD = 50;

export type LoungeFeedPost = {
  id: string;
  nickname: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null; // executiveRole === OTHER 일 때의 비표준 직책 원본
  industryName: string | null;
  verified: boolean;
  createdAt: Date;
  category: DB.LoungeCategory;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  hot: boolean;
};

// 업종 탭은 작성자 회사(Company.industry)의 업종명으로, 카테고리 탭은 게시글 자체의
// LoungeCategory로 필터한다 — 서로 다른 축이라 함께 걸 수 있다. q는 제목·내용 대상 검색.
export type LoungeFeedQuery = { industry?: string; category?: DB.LoungeCategory; q?: string };

export async function getLoungeFeedQuery({
  industry,
  category,
  q,
}: LoungeFeedQuery = {}): Promise<LoungeFeedPost[]> {
  const posts = await prisma.loungePost.findMany({
    where: {
      deletedAt: null,
      hiddenAt: null,
      ...(industry ? { author: { company: { industry: { name: industry } } } } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
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
    },
  });

  return posts.map((p) => ({
    id: p.id,
    nickname: p.author.loungeProfile?.nickname ?? '익명',
    executiveRole: p.author.executiveRole,
    jobTitle: p.author.jobTitle,
    industryName: p.author.company?.industry.name ?? null,
    verified: p.author.approvedAt != null,
    createdAt: p.createdAt,
    category: p.category,
    title: p.title,
    content: p.content,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
    bookmarkCount: p.bookmarkCount,
    hot: p.likeCount + p.commentCount >= HOT_THRESHOLD,
  }));
}
