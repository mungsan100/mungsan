import 'server-only';

import { connection } from 'next/server';
import { prisma } from '@mungsan/db';

// 실시간 트렌드 = 최근 창 안에서 댓글 많은 글 상위 N. 트렌드 집계 모델이 없어 반응 카운트로 파생한다.
const TREND_WINDOW_DAYS = 30;
const TREND_LIMIT = 3;

export type LoungeTrend = {
  id: string;
  title: string;
  commentCount: number;
};

export async function getLoungeTrendsQuery(): Promise<LoungeTrend[]> {
  // 최근 창 경계를 요청 시점 now로 계산 — cacheComponents에서 동적임을 명시한다.
  await connection();
  const since = new Date(Date.now() - TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  return prisma.loungePost.findMany({
    where: { deletedAt: null, hiddenAt: null, createdAt: { gte: since }, commentCount: { gt: 0 } },
    orderBy: [{ commentCount: 'desc' }, { createdAt: 'desc' }],
    take: TREND_LIMIT,
    select: { id: true, title: true, commentCount: true },
  });
}
