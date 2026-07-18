import { Suspense } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

import { ResetPasswordForm } from '@/app/(auth)/reset-password/ui/reset-password-form';

// 메일 링크로 진입하는 새 비밀번호 설정 화면. params(요청 단위 데이터)는 Suspense 안에서
// await 한다(cacheComponents — 정적 셸 프리렌더 + 동적 부분 스트리밍, company 페이지 패턴).
// 토큰 유효성은 제출 시 액션에서 검증한다(만료/사용됨이면 액션이 안내 메시지를 반환).
export default function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-ink-900 text-xl font-bold">새 비밀번호 설정</h1>
        <p className="text-ink-500 text-sm">사용하실 새 비밀번호를 입력해 주세요.</p>
      </div>
      <Suspense fallback={<FormFallback />}>
        <TokenFormLoader params={params} />
      </Suspense>
    </div>
  );
}

async function TokenFormLoader({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}

function FormFallback() {
  return (
    <div className="flex justify-center py-10" aria-hidden>
      <LuLoaderCircle className="text-ink-300 h-6 w-6 animate-spin" />
    </div>
  );
}
