import 'server-only';

import { connection } from 'next/server';
import { cache } from 'react';
import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { DEMO_USER_EMAIL } from '@/config/server';

// 데모 현재-유저 리졸버 — apps/service엔 아직 인증/세션이 없다. DEMO_USER_EMAIL(있으면)
// 또는 가장 먼저 승인된 User를 "로그인 유저"로 간주한다. 실제 인증을 붙일 때 이 함수만
// 교체하면 되도록 교체 지점을 한 곳에 모은다 — 호출부는 CurrentUser 계약에만 의존한다.
export type CurrentUser = {
  id: string;
  name: string;
  executiveRole: DB.ExecutiveRole;
};

// cache()로 요청 단위 메모이즈 — 한 요청의 여러 RSC 섹션이 호출해도 조회는 1회.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  await connection(); // 요청 시점 동적 — 실제 인증에선 여기서 세션 쿠키를 읽는다.

  const user = DEMO_USER_EMAIL
    ? await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } })
    : await prisma.user.findFirst({
        where: { approvedAt: { not: null }, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });

  if (!user)
    throw new Error(
      '현재 유저를 확정할 수 없습니다 — DEMO_USER_EMAIL을 설정하거나 승인된 User가 최소 1명 필요합니다.',
    );

  return { id: user.id, name: user.name, executiveRole: user.executiveRole };
});
