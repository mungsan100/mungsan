import 'server-only';

import { prisma } from '@mungsan/db';
import { getSignedReadUrl } from '@mungsan/file/server';

// 내 명함첩 목록(2026-07-21) — 본인이 저장한 명함. 원본 이미지는 PRIVATE 라 서명 URL 을 발급해 넘긴다.
export type MyCard = {
  id: string;
  name: string | null;
  company: string | null;
  jobTitle: string | null;
  phone: string | null;
  email: string | null;
  imageUrl: string; // 서명 URL(만료 5분) — 목록 썸네일/열람용
  createdAt: Date;
};

// 검색(2026-07-22, 명함첩 전용 페이지) — 이름·회사·직책·연락처·이메일 부분 일치(대소문자 무시).
// take: 내 정보 허브 미리보기(3장)처럼 일부만 필요할 때 서명 URL 발급을 그만큼만 한다.
export async function getMyCardsQuery(
  userId: string,
  options: { q?: string; take?: number } = {},
): Promise<MyCard[]> {
  const q = options.q?.trim();
  const cards = await prisma.businessCard.findMany({
    where: {
      ownerId: userId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { company: { contains: q, mode: 'insensitive' } },
              { jobTitle: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    ...(options.take ? { take: options.take } : {}),
    select: {
      id: true,
      name: true,
      company: true,
      jobTitle: true,
      phone: true,
      email: true,
      imagePathname: true,
      createdAt: true,
    },
  });

  // 각 명함의 비공개 이미지에 서명 URL 발급(본인 목록이라 인가는 소유자 조회로 이미 충족).
  return Promise.all(
    cards.map(async ({ imagePathname, ...c }) => ({
      ...c,
      imageUrl: await getSignedReadUrl(imagePathname),
    })),
  );
}

// 보유 명함 수 — 허브 미리보기의 "전체 N장 보기" 표기용(검색 무관 전체 기준).
export async function countMyCardsQuery(userId: string): Promise<number> {
  return prisma.businessCard.count({ where: { ownerId: userId } });
}
