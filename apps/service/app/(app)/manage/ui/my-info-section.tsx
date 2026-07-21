import { LuIdCard } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getLoungeProfileQuery } from '../queries/lounge-profile.query';
import { getIndustryOptionsQuery, getMyInfoQuery } from '../queries/my-info.query';
import { CompanyInfoForm } from './company-info-form';
import { MyInfoForm } from './my-info-form';

// 프로필 카드(2026-07-21 IA) — 개인정보 조회/수정 + 라운지 닉네임(표시) + 회사 정보 조회/수정.
// 비밀번호 변경·닉네임 변경은 설정(더보기 > 설정)으로 이관 — 여기선 닉네임을 표시만 한다.
export async function MyInfoSection() {
  const user = await getCurrentUser();
  const [info, industries, loungeProfile] = await Promise.all([
    getMyInfoQuery(user.id),
    getIndustryOptionsQuery(),
    getLoungeProfileQuery(user.id),
  ]);

  return (
    <section className="px-5">
      <SectionHeader icon={<LuIdCard className="h-[18px] w-[18px]" />} title="프로필" />
      <div className="shadow-card mt-3 space-y-5 rounded-2xl bg-white p-4">
        <MyInfoForm info={info} />

        {/* 라운지 닉네임 — 표시만(변경은 설정). 실명과 무관한 가명. */}
        <div className="border-ink-100 border-t pt-4">
          <p className="text-ink-900 text-sm font-bold">라운지 닉네임</p>
          <p className="text-ink-500 mt-1 text-[13px]">
            라운지 게시글·댓글에 표시되는 가명이에요. 변경은 설정에서 할 수 있어요.
          </p>
          <p className="text-ink-900 mt-2 text-sm font-semibold">{loungeProfile.nickname}</p>
        </div>

        <div className="border-ink-100 border-t pt-4">
          {info.company ? (
            <CompanyInfoForm company={info.company} industries={industries} />
          ) : (
            <div className="space-y-2">
              <p className="text-ink-900 text-sm font-bold">회사 정보</p>
              <p className="text-ink-400 text-sm">등록된 회사 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
