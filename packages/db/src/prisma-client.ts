import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Prisma 7은 드라이버 어댑터 필수. pg 는 URL 의 ?schema= 를 무시하므로 schema 를
// 환경(DATABASE_URL)에서 직접 읽어 두 곳에 동일하게 적용한다 — 하드코딩 금지, 환경마다 자동 적응.
//   1) 어댑터 { schema }      → ORM 쿼리를 "schema"."Table" 로 정규화
//   2) pg options search_path → $queryRaw 의 비정규화 식별자("Order")가 같은 schema 로 해석되게 함
// 둘 중 하나라도 빠지면 ORM 은 되는데 raw 만 깨지는(=배포에서만 42P01) 불일치가 난다.
const connectionString = process.env.DATABASE_URL;
const schema = connectionString
  ? (new URL(connectionString).searchParams.get('schema') ?? undefined)
  : undefined;
const adapter = new PrismaPg(
  { connectionString, options: schema ? `-c search_path=${schema},public` : undefined },
  schema ? { schema } : undefined,
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // dev에서 'query'를 빼는 이유: Prisma는 query 이벤트의 타이밍을 재려고 쿼리마다 동기
    // new Date()를 호출하는데(generated runtime: `n===void 0?i:async()=>{let s=new Date,...}`,
    // n=query 로그 콜백), Next cacheComponents가 prerender 중 이 현재시각 읽기를 차단해
    // <Suspense> 안 bare Prisma 조회까지 "used new Date() before ..." 에러를 낸다. 끄면 dev=prod.
    // (stale client/NowGenerator 아님 — A/B 실증. 상세: memory cachecomponents-prisma-query-log-newdate)
    log: process.env.APP_ENV === 'dev' ? ['error', 'warn'] : ['error'],
  });

if (process.env.APP_ENV !== 'prod') globalForPrisma.prisma = prisma;
