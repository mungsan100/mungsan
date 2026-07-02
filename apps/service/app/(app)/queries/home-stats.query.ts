import 'server-only';

import { prisma } from '@mungsan/db';

// 진행 협업 = 내 프로젝트 수, 매칭 대기 = 내가 보낸 미응답(respondedAt null) 협업 제안 수.
export type HomeStats = { activeCollaborations: number; pendingMatches: number };

export async function getHomeStatsQuery(userId: string): Promise<HomeStats> {
  const [activeCollaborations, pendingMatches] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.collaborationProposal.count({ where: { proposerId: userId, respondedAt: null } }),
  ]);
  return { activeCollaborations, pendingMatches };
}
