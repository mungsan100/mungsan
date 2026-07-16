import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getLoungeProfileQuery } from '../queries/lounge-profile.query';
import { LoungeProfileForm } from './lounge-profile-form';

// 라운지 가명 설정 카드 — 여기서 정한 닉네임만 라운지 화면에 노출되고, 실명·이메일은 노출되지 않는다.
export async function LoungeProfileSection() {
  const user = await getCurrentUser();
  const profile = await getLoungeProfileQuery(user.id);

  return (
    <Card className="p-5">
      <h2 className="text-ink-900 text-base font-bold">라운지 닉네임</h2>
      <p className="text-ink-500 mt-1 text-[13px]">
        라운지 게시글·댓글에는 실명 대신 아래 닉네임만 표시됩니다.
      </p>
      <div className="mt-3">
        <LoungeProfileForm nickname={profile.nickname} />
      </div>
    </Card>
  );
}
