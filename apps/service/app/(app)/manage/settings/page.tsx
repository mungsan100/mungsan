import { Suspense } from 'react';

import { logoutAction } from '@/app/(auth)/pending/commands/logout.action';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { BackHeader } from '../../ui/back-header';
import { getLoungeProfileQuery } from '../queries/lounge-profile.query';
import { getMyInfoQuery } from '../queries/my-info.query';
import { ChangePasswordForm } from '../ui/change-password-form';
import { LoungeProfileForm } from '../ui/lounge-profile-form';
import { SubpageSkeleton } from '../ui/subpage-back';
import { WithdrawSection } from '../ui/withdraw-section';

// 설정(2026-07-21 IA 2차) — 더보기 > 설정. 계정 관리·비밀번호 재설정·라운지 닉네임 설정·회원탈퇴·로그아웃.
export default function SettingsPage() {
  return (
    <>
      <BackHeader />
      <main className="space-y-6 px-5 pt-3 pb-24">
        <h1 className="text-ink-900 text-xl font-bold">설정</h1>
        <Suspense fallback={<SubpageSkeleton />}>
          <SettingsContent />
        </Suspense>
      </main>
    </>
  );
}

async function SettingsContent() {
  const user = await getCurrentUser();
  const [info, loungeProfile] = await Promise.all([
    getMyInfoQuery(user.id),
    getLoungeProfileQuery(user.id),
  ]);

  return (
    <div className="space-y-4">
      {/* 계정 관리 — 로그인 계정(이메일)은 변경 불가라 표시만. */}
      <div className="shadow-card space-y-1 rounded-2xl bg-white p-4">
        <p className="text-ink-900 text-sm font-bold">계정 관리</p>
        <p className="text-ink-500 text-[13px]">로그인 계정</p>
        <p className="text-ink-900 text-sm font-semibold break-all">{info.email}</p>
      </div>

      {/* 비밀번호 재설정 */}
      <div className="shadow-card rounded-2xl bg-white p-4">
        <ChangePasswordForm />
      </div>

      {/* 라운지 닉네임 설정 */}
      <div className="shadow-card space-y-3 rounded-2xl bg-white p-4">
        <div>
          <p className="text-ink-900 text-sm font-bold">라운지 닉네임 설정</p>
          <p className="text-ink-500 mt-1 text-[13px]">
            라운지 게시글·댓글에는 실명 대신 아래 닉네임만 표시됩니다.
          </p>
        </div>
        <LoungeProfileForm nickname={loungeProfile.nickname} />
      </div>

      {/* 로그아웃 */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="border-ink-200 text-ink-500 hover:bg-ink-100 w-full rounded-xl border bg-white py-3 text-sm font-semibold"
        >
          로그아웃
        </button>
      </form>

      {/* 회원 탈퇴 */}
      <div className="shadow-card rounded-2xl bg-white p-4">
        <WithdrawSection />
      </div>
    </div>
  );
}
