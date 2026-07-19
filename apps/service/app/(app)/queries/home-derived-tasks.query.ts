import 'server-only';

import { prisma } from '@mungsan/db';

// 홈 "다가오는 할 일"의 파생 항목 — DB Task 를 만들지 않고 조회 시점에 사실에서 도출한다
// (2026-07-20 결정 7). 저장을 취소하거나 응답하면 자동으로 사라지고, 셰르파 로직은 건드리지 않는다.
// 소스 3종: ① 저장한 협업 공고 마감 임박 ② 응답 대기 중인 받은 제안 ③ 마감 임박한 임시저장 제안.
// ※ 지원사업(K-Startup) 공고는 저장 기능이 없어 이번 범위에서 제외(결정).
const DEADLINE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 마감 D-7 이내만 할일로 승격
const DERIVED_TAKE = 3;

export type DerivedHomeTask = {
  key: string; // 렌더 키(kind:id)
  kind: 'SAVED_POST_DEADLINE' | 'PROPOSAL_AWAITING' | 'DRAFT_DEADLINE';
  postTitle: string;
  dueDate: Date | null; // 공고 마감(응답 대기는 null)
  count: number; // PROPOSAL_AWAITING 의 대기 건수(그 외 1)
  href: string;
};

export async function getHomeDerivedTasksQuery(userId: string): Promise<DerivedHomeTask[]> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + DEADLINE_WINDOW_MS);
  // 노출 가능한 공고 공통 조건 — 삭제·숨김·비공개 공고는 할일로도 승격하지 않는다.
  const visiblePost = { isPublic: true, deletedAt: null, hiddenAt: null } as const;

  const [savedPosts, awaiting, drafts] = await Promise.all([
    // ① 저장한 협업 공고 중 마감 D-7 이내(마감 지난 건 제외)
    prisma.collaborationBookmark.findMany({
      where: {
        userId,
        post: { ...visiblePost, applicationDeadline: { gte: now, lte: windowEnd } },
      },
      select: {
        post: { select: { id: true, title: true, applicationDeadline: true } },
      },
    }),
    // ② 내 공고가 받은 제안 중 응답 대기(제출됨·검토중) — 공고 단위로 묶어 한 카드로
    prisma.collaborationProposal.groupBy({
      by: ['postId'],
      where: {
        post: { authorId: userId, deletedAt: null },
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
      _count: { postId: true },
    }),
    // ③ 내 임시저장 제안 중 해당 공고 마감이 D-7 이내 — 제출을 놓치기 전에
    prisma.collaborationProposal.findMany({
      where: {
        proposerId: userId,
        status: 'DRAFT',
        post: { ...visiblePost, applicationDeadline: { gte: now, lte: windowEnd } },
      },
      select: {
        id: true,
        post: { select: { id: true, title: true, applicationDeadline: true } },
      },
    }),
  ]);

  // 응답 대기 카드의 공고 제목 해석(groupBy 는 관계를 못 싣는다).
  const awaitingPostIds = awaiting.map((row) => row.postId);
  const awaitingPosts = awaitingPostIds.length
    ? await prisma.collaborationPost.findMany({
        where: { id: { in: awaitingPostIds } },
        select: { id: true, title: true },
      })
    : [];
  const awaitingTitle = new Map(awaitingPosts.map((post) => [post.id, post.title]));

  const derived: DerivedHomeTask[] = [
    ...savedPosts.map(({ post }) => ({
      key: `saved:${post.id}`,
      kind: 'SAVED_POST_DEADLINE' as const,
      postTitle: post.title,
      dueDate: post.applicationDeadline,
      count: 1,
      href: `/collab/${post.id}`,
    })),
    ...awaiting.map((row) => ({
      key: `awaiting:${row.postId}`,
      kind: 'PROPOSAL_AWAITING' as const,
      postTitle: awaitingTitle.get(row.postId) ?? '협업 공고',
      dueDate: null,
      count: row._count.postId,
      href: '/manage',
    })),
    ...drafts.map((draft) => ({
      key: `draft:${draft.id}`,
      kind: 'DRAFT_DEADLINE' as const,
      postTitle: draft.post.title,
      dueDate: draft.post.applicationDeadline,
      count: 1,
      href: `/collab/${draft.post.id}`,
    })),
  ];

  // 긴급순(마감 가까운 순, 마감 없는 응답 대기는 뒤) 상위 N — 위젯이 길어지지 않게.
  return derived
    .sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity))
    .slice(0, DERIVED_TAKE);
}
