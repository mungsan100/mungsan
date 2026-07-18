import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LuChevronLeft, LuLoaderCircle } from 'react-icons/lu';

import { getSession } from '@/lib/auth/session';
import { logoutAction } from '@/app/(auth)/pending/commands/logout.action';
import { getIndustriesQuery } from '@/app/(auth)/company/queries/industries.query';
import { CompanyForm } from '@/app/(auth)/company/ui/company-form';

// 세션·업종목록 조회(동적)는 CompanyPageContent로 분리해 Suspense로 감싼다 — 그래야
// cacheComponents가 이 페이지의 정적 셸(제목·설명)을 프리렌더하고 동적 부분만 스트리밍한다.
export default function CompanyPage() {
  return (
    <div className="space-y-6">
      {/* 뒤로가기 — 이 단계는 세션이 이미 생긴 뒤라 되돌아갈 이전 화면이 없다.
          로그아웃으로 세션을 정리하고 로그인 화면으로 보낸다(계정 전환·중단 경로). */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-ink-500 hover:text-ink-900 -ml-1 inline-flex items-center gap-0.5 text-sm"
        >
          <LuChevronLeft className="h-4 w-4" />
          로그인 화면으로
        </button>
      </form>
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
