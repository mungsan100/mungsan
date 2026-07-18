import { LuUserRound } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getIndustryOptionsQuery, getMyInfoQuery } from '../queries/my-info.query';
import { ChangePasswordForm } from './change-password-form';
import { CompanyInfoForm } from './company-info-form';
import { MyInfoForm } from './my-info-form';

// 내 정보 마이페이지(PRD 우선순위 4) — 개인정보 조회/수정 + 회사 정보 조회/수정(재심사 전환)
// + 비밀번호 변경.
export async function MyInfoSection() {
  const user = await getCurrentUser();
  const [info, industries] = await Promise.all([
    getMyInfoQuery(user.id),
    getIndustryOptionsQuery(),
  ]);

  return (
    <section className="px-5">
      <SectionHeader icon={<LuUserRound className="h-[18px] w-[18px]" />} title="내 정보" />
      <div className="shadow-card mt-3 space-y-5 rounded-2xl bg-white p-4">
        <MyInfoForm info={info} />

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

        <div className="border-ink-100 border-t pt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </section>
  );
}
