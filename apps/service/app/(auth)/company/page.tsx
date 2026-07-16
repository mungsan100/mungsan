import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

import { getSession } from '@/lib/auth/session';
import { getIndustriesQuery } from '@/app/(auth)/company/queries/industries.query';
import { CompanyForm } from '@/app/(auth)/company/ui/company-form';

// 세션·업종목록 조회(동적)는 CompanyPageContent로 분리해 Suspense로 감싼다 — 그래야
// cacheComponents가 이 페이지의 정적 셸(제목·설명)을 프리렌더하고 동적 부분만 스트리밍한다.
export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-ink-900 text-xl font-bold">기업정보 등록</h1>
        <p className="text-ink-500 text-sm">
          협업 제안 시 신뢰도 확인을 위해 회사 정보와 서류가 필요합니다.
        </p>
      </div>
      <Suspense fallback={<CompanyFormFallback />}>
        <CompanyPageContent />
      </Suspense>
    </div>
  );
}

async function CompanyPageContent() {
  const session = await getSession();
  if (!session) redirect('/login');

  const industries = await getIndustriesQuery();
  return <CompanyForm industries={industries} />;
}

function CompanyFormFallback() {
  return (
    <div className="flex justify-center py-10" aria-hidden>
      <LuLoaderCircle className="text-ink-300 h-6 w-6 animate-spin" />
    </div>
  );
}
