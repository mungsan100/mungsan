import { LuLock } from 'react-icons/lu';

import { getLoungeMemberCountQuery } from '../queries/lounge-stats.query';

// 헤더 서브라인 — 인증(승인)된 C-LEVEL 회원 실수치. 밝은 헤더 톤(ink).
export async function LoungeMemberCount() {
  const count = await getLoungeMemberCountQuery();
  return (
    <p className="text-ink-500 mt-1.5 flex items-center gap-1.5 text-[13px] font-medium">
      <LuLock className="h-3.5 w-3.5" />
      인증된 C-LEVEL {count.toLocaleString()}명
    </p>
  );
}
