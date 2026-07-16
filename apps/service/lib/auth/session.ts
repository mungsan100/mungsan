import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

const COOKIE_NAME = 'mungsan_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30일

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// 로그인 성공 시 호출 — 세션 row 생성 + httpOnly 쿠키 설정.
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  executiveRole: DB.ExecutiveRole;
  approvedAt: Date | null;
  suspendedAt: Date | null;
  withdrawnAt: Date | null;
  company: { id: string } | null;
};

// 쿠키 → 세션 조회. 세션은 있되 승인/정지 여부는 안 걸러낸다 — 그건 호출부(레이아웃 게이트)의 몫.
// cache()로 요청 단위 메모이즈.
export const getSession = cache(async (): Promise<SessionUser | null> => {
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { company: { select: { id: true } } } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  if (session.user.deletedAt || session.user.withdrawnAt) return null;

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    executiveRole: user.executiveRole,
    approvedAt: user.approvedAt,
    suspendedAt: user.suspendedAt,
    withdrawnAt: user.withdrawnAt,
    company: user.company,
  };
});

// 로그아웃 — DB 세션 row 삭제 + 쿠키 제거.
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}
