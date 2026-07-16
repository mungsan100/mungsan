import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/session';

import { getIndustriesQuery } from './queries/industries.query';
import { CompanyForm } from './ui/company-form';

export default async function CompanyPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const industries = await getIndustriesQuery();

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-ink-900 text-xl font-bold">기업정보 등록</h1>
        <p className="text-ink-500 text-sm">
          협업 제안 시 신뢰도 확인을 위해 회사 정보와 서류가 필요합니다.
        </p>
      </div>
      <CompanyForm industries={industries} />
    </div>
  );
}
