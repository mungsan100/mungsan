import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { prisma } from '@mungsan/db';

import { IS_PRODUCTION } from '@/config/server';

const COOKIE_NAME = 'mungsan_admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일 — 운영자 세션은 서비스(30일)보다 짧게

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// 로그인 성공 시 호출 — 세션 row 생성 + httpOnly 쿠키 설정.
export async function createAdminSession(adminId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.adminSession.create({ data: { tokenHash: hashToken(token), adminId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export type SessionAdmin = {
  id: string;
  email: string;
  name: string;
};

// 쿠키 → 관리자 세션 조회. 액션·쿼리의 인가 확인은 전부 이 함수를 거친다.
// cache()로 요청 단위 메모이즈.
export const getAdminSession = cache(async (): Promise<SessionAdmin | null> => {
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const { admin } = session;
  return { id: admin.id, email: admin.email, name: admin.name };
});

// 로그아웃 — DB 세션 row 삭제 + 쿠키 제거.
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}
