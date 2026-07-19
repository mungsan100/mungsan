// 업종 카탈로그 개편 스크립트 (2026-07-19 결정) — 6종 → 11종.
// 기존 업종은 "이름만 바꾸고 id를 유지"해 회사·공고의 업종 참조가 무수정으로 유효하다.
// 멱등: 몇 번을 실행해도 최종 상태는 같다(개명 대상이 없으면 건너뛰고, 없는 업종만 생성).
// "기타"는 의도적으로 없다 — 회원은 가장 가까운 업종을 선택한다(관리·필터·추천 품질 유지).
//
// 사용: node --env-file=.env scripts/update-industries.mjs
import { PrismaClient } from '../../../packages/db/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const url = new URL(process.env.DATABASE_URL);
const schema = url.searchParams.get('schema') ?? 'public';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema }),
});

// 구명 → 신명 (id 유지 개명). '제조'는 그대로 유지.
const RENAMES = [
  ['IT·SaaS', 'IT·소프트웨어'],
  ['핀테크', '금융·핀테크'],
  ['헬스케어', '의료·헬스케어·바이오'],
  ['커머스·리테일', '도소매·유통'],
  ['물류·모빌리티', '물류·운송'],
];

// 최종 카탈로그 11종 — 통계청 전국사업체조사 사업체 수 상위 대분류 + B2B 협업 적합성 기준 선별.
const FINAL_INDUSTRIES = [
  '제조',
  '도소매·유통',
  'IT·소프트웨어',
  '식음료·외식',
  '물류·운송',
  '건설·부동산',
  '전문서비스',
  '교육',
  '의료·헬스케어·바이오',
  '금융·핀테크',
  '미디어·콘텐츠·광고',
];

for (const [oldName, newName] of RENAMES) {
  const existing = await prisma.industry.findUnique({ where: { name: oldName }, select: { id: true } });
  if (!existing) {
    console.log(`skip rename (없음): ${oldName}`);
    continue;
  }
  await prisma.industry.update({ where: { id: existing.id }, data: { name: newName } });
  console.log(`renamed: ${oldName} → ${newName} (id 유지: ${existing.id})`);
}

for (const name of FINAL_INDUSTRIES) {
  const existing = await prisma.industry.findUnique({ where: { name }, select: { id: true } });
  if (existing) continue;
  const created = await prisma.industry.create({ data: { name }, select: { id: true } });
  console.log(`created: ${name} (${created.id})`);
}

const all = await prisma.industry.findMany({
  orderBy: { createdAt: 'asc' },
  select: { name: true, _count: { select: { companies: true } } },
});
console.log('--- 최종 카탈로그 ---');
for (const industry of all) console.log(`${industry.name} (회사 ${industry._count.companies}곳)`);
await prisma.$disconnect();
