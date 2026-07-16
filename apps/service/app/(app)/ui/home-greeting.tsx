import { LuHand } from 'react-icons/lu';

import { getCurrentUser } from '@/lib/auth/get-current-user';

// 인사 한 줄 — 현재 유저 이름을 실연결. 헤더에서 이 줄만 동적으로 스트리밍한다.
export async function HomeGreeting() {
  const user = await getCurrentUser();
  return (
    <p className="text-ink-600 flex items-center gap-1.5 text-[15px] font-medium">
      안녕하세요, {user.name}님
      <LuHand className="h-4 w-4 text-amber-400" />
    </p>
  );
}
