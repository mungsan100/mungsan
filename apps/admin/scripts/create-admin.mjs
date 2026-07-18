// 최초 관리자 계정 생성 CLI. Admin 테이블에 계정을 만들고(이메일 중복 시 비밀번호·이름 갱신),
// 비밀번호는 lib/auth/password.ts 와 동일한 scrypt `salt:hash` 형식으로 저장한다
// (그 파일은 server-only 가드라 단독 스크립트에서 import 불가 — 해시 로직만 여기 중복).
//
// 실행 (apps/admin 디렉터리에서):
//   node --env-file=.env scripts/create-admin.mjs <email> <password> <이름>
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../../packages/db/generated/client/index.js';

const scrypt = promisify(scryptCallback);

// eslint-disable-next-line no-restricted-syntax -- 단독 CLI 스크립트: --env-file 로 주입된 env 원본 읽기 허용(Next 밖이라 config/server.ts 사용 불가)
const connectionString = process.env.DATABASE_URL;

const [email, password, name] = process.argv.slice(2);
if (!email || !password || !name) {
  console.error('사용법: node --env-file=.env scripts/create-admin.mjs <email> <password> <이름>');
  process.exit(1);
}
if (!connectionString) {
  console.error('DATABASE_URL 이 없습니다 — apps/admin 디렉터리에서 --env-file=.env 로 실행하세요.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('비밀번호는 8자 이상이어야 합니다.');
  process.exit(1);
}

// packages/db/src/prisma-client.ts 와 동일한 schema 파생(DATABASE_URL 의 ?schema= 대응).
const schema = new URL(connectionString).searchParams.get('schema') ?? undefined;
const adapter = new PrismaPg(
  { connectionString, options: schema ? `-c search_path=${schema},public` : undefined },
  schema ? { schema } : undefined,
);
const prisma = new PrismaClient({ adapter });

const salt = randomBytes(16).toString('hex');
const derived = await scrypt(password, salt, 64);
const passwordHash = `${salt}:${derived.toString('hex')}`;

const normalizedEmail = email.trim().toLowerCase();
const admin = await prisma.admin.upsert({
  where: { email: normalizedEmail },
  create: { email: normalizedEmail, passwordHash, name },
  update: { passwordHash, name },
});
console.log(`관리자 계정 준비 완료: ${admin.email} (${admin.name})`);
await prisma.$disconnect();
