import { LuUserRound } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getMyInfoQuery } from '../queries/my-info.query';
import { ChangePasswordForm } from './change-password-form';
import { MyInfoForm } from './my-info-form';

// 내 정보 마이페이지(PRD 우선순위 4) — 개인정보 조회/수정 + 회사 정보 조회 + 비밀번호 변경.
export async function MyInfoSection() {
  const user = await getCurrentUser();
  const info = await getMyInfoQuery(user.id);

  return (
    <section className="px-5">
      <SectionHeader icon={<LuUserRound className="h-[18px] w-[18px]" />} title="내 정보" />
      <div className="shadow-card mt-3 space-y-5 rounded-2xl bg-white p-4">
        <MyInfoForm info={info} />

        <div className="border-ink-100 space-y-2 border-t pt-4">
          <p className="text-ink-900 text-sm font-bold">회사 정보</p>
          {info.company ? (
            <dl className="space-y-1.5">
              <InfoRow label="회사명" value={info.company.name} />
              <InfoRow label="사업자등록번호" value={info.company.businessRegistrationNo} />
              <InfoRow label="업종" value={info.company.industryName} />
            </dl>
          ) : (
            <p className="text-ink-400 text-sm">등록된 회사 정보가 없습니다.</p>
          )}
          <p className="text-ink-400 text-xs">
            회사 정보 변경은 사업자등록증 재확인이 필요해 운영팀에 문의해 주세요.
          </p>
        </div>

        <div className="border-ink-100 border-t pt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </section>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <dt className="text-ink-400 w-28 shrink-0 text-sm">{label}</dt>
    <dd className="text-ink-900 text-sm break-all">{value}</dd>
  </div>
);
