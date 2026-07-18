import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { LuLoaderCircle } from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { logoutAction } from '@/app/(auth)/pending/commands/logout.action';
import { isRereviewQuery } from '@/app/(auth)/pending/queries/rereview.query';

// 세션 조회(동적)는 PendingContent로 분리해 Suspense로 감싼다(cacheComponents — company 페이지와
// 동일 패턴). 반려된 계정은 심사중 안내 대신 반려 사실과 사유(입력된 경우)를 보여준다.
export default function PendingPage() {
  return (
    <Suspense fallback={<PendingFallback />}>
      <PendingContent />
    </Suspense>
  );
}

async function PendingContent() {
  const session = await getSession();
  if (!session) redirect('/login');

  const rejected = session.rejectedAt != null;
  // 회사 정보 수정으로 온 재심사인지 — 첫 가입 심사와 안내 문구를 구분한다.
  const rereview = !rejected && (await isRereviewQuery(session.id));

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-ink-900 text-xl font-bold">
          {rejected ? '가입이 반려되었습니다' : rereview ? '재심사중입니다' : '가입심사중입니다'}
        </h1>
        {rejected ? (
          <div className="space-y-3">
            <p className="text-ink-500 text-sm">제출하신 기업정보로는 가입을 승인하지 못했습니다.</p>
            {session.rejectedReason && (
              <div className="bg-ink-100 rounded-lg px-4 py-3 text-left">
                <p className="text-ink-500 mb-1 text-xs font-semibold">반려 사유</p>
                <p className="text-ink-700 text-sm whitespace-pre-wrap">{session.rejectedReason}</p>
              </div>
            )}
            <p className="text-ink-500 text-sm">자세한 내용은 운영팀에 문의해 주세요.</p>
          </div>
        ) : rereview ? (
          <p className="text-ink-500 text-sm">
            회사 정보 수정으로 재심사가 진행 중입니다. 승인이 완료되면 다시 서비스를 이용하실 수
            있어요.
          </p>
        ) : (
          <p className="text-ink-500 text-sm">
            제출하신 기업정보를 확인하고 있습니다. 승인이 완료되면 서비스를 이용하실 수 있어요.
          </p>
        )}
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="lg" className="w-full">
          로그아웃
        </Button>
      </form>
    </div>
  );
}

function PendingFallback() {
  return (
    <div className="flex justify-center py-10" aria-hidden>
      <LuLoaderCircle className="text-ink-300 h-6 w-6 animate-spin" />
    </div>
  );
}
