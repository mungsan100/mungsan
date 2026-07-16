import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { prisma } from '@mungsan/db';

const COOKIE_NAME = 'mungsan_session';

// (app) 그룹 진입 전 세션·기업등록·승인 상태를 확인해 미충족 시 각 단계로 되돌린다
// (로그인 → 기업정보등록 → 가입심사중). React 트리 밖(HTTP 레벨)에서 처리해
// cacheComponents의 정적 프리렌더링·중첩 Suspense와 충돌하지 않는다.
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { include: { company: { select: { id: true } } } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  const { user } = session;
  if (user.deletedAt || user.withdrawnAt) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (!user.company) return NextResponse.redirect(new URL('/company', request.url));
  if (!user.approvedAt || user.suspendedAt) {
    return NextResponse.redirect(new URL('/pending', request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/', '/lounge/:path*', '/collab/:path*', '/sherpa/:path*', '/manage/:path*'],
};
