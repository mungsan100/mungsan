import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { prisma } from '@mungsan/db';

const COOKIE_NAME = 'mungsan_admin_session';

// 운영 화면 진입 전 관리자 세션을 확인해 미로그인 시 /login 으로 되돌린다.
// React 트리 밖(HTTP 레벨)에서 처리해 cacheComponents의 정적 프리렌더링·중첩 Suspense와
// 충돌하지 않는다(service 의 레이아웃 AuthGate 무한 로딩 버그 교훈). service 는 middleware.ts
// 컨벤션이지만 admin 은 신규 파일이라 Next 16.2 의 후속 컨벤션인 proxy.ts 로 작성한다.
export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const session = await prisma.adminSession.findUnique({ where: { tokenHash } });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// proxy 는 항상 Node.js 런타임 — middleware 와 달리 runtime 지정이 금지된다(빌드 에러).
// ⚠ /api/health(배포 헬스체크)는 인증 없이 200이어야 하므로 matcher 에 절대 포함하지 말 것.
export const config = {
  matcher: ['/', '/approvals/:path*'],
};
