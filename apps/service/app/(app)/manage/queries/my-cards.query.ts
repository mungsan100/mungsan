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

export async function getMyCardsQuery(userId: string): Promise<MyCard[]> {
  const cards = await prisma.businessCard.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
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
