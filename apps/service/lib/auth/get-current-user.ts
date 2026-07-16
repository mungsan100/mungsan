import 'server-only';

import { cache } from 'react';
import type { DB } from '@mungsan/db';

import { getSession } from '@/lib/auth/session';

export type CurrentUser = {
  id: string;
  name: string;
  executiveRole: DB.ExecutiveRole;
};

// 호출부는 이 CurrentUser 계약에만 의존한다. 레이아웃 게이트(app/(app)/layout.tsx)를
// 통과한 뒤에만 이 함수가 호출되므로, 세션이 없으면 그 자체로 불변식 위반이다.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const session = await getSession();
  if (!session) throw new Error('로그인이 필요합니다 — 인증되지 않은 상태로 getCurrentUser가 호출됐습니다.');

  return { id: session.id, name: session.name, executiveRole: session.executiveRole };
});
