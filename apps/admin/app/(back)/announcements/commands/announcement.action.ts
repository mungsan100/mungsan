'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

// 공지 작성(2026-07-20, 4-1 B안) — 초안으로 저장(미게시). 게시는 별도 액션.
export async function createAnnouncementAction(cmd: {
  title: string;
  content: string;
}): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const title = cmd.title.trim();
  const content = cmd.content.trim();
  if (title.length < 2 || title.length > TITLE_MAX)
    return { ok: false, field: 'title', message: `제목은 2~${TITLE_MAX}자로 입력해 주세요.` };
  if (content.length < 5 || content.length > CONTENT_MAX)
    return { ok: false, field: 'content', message: `내용은 5~${CONTENT_MAX}자로 입력해 주세요.` };

  await prisma.announcement.create({ data: { title, content, authorAdminId: admin.id } });
  revalidatePath('/announcements');
  return { ok: true, data: undefined, message: '공지를 저장했습니다. 게시하면 회원에게 노출됩니다.' };
}

// 게시/내림 토글. 게시 시 notify=true 면 아직 발송 안 한(notifiedAt null) 공지에 한해
// 전 회원에게 SYSTEM 알림을 1회 fan-out 한다(중복 발송 방지). 내림은 publishedAt 만 null 로.
export async function setAnnouncementPublishedAction(cmd: {
  announcementId: string;
  publish: boolean;
  notify?: boolean;
}): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  const announcement = await prisma.announcement.findUnique({
    where: { id: cmd.announcementId },
    select: { id: true, title: true, publishedAt: true, notifiedAt: true },
  });
  if (!announcement) return { ok: false, code: 'NOT_FOUND', message: '없는 공지입니다.' };

  if (!cmd.publish) {
    await prisma.announcement.update({
      where: { id: announcement.id },
      data: { publishedAt: null },
    });
    revalidatePath('/announcements');
    revalidatePath('/', 'layout');
    return { ok: true, data: undefined, message: '공지를 내렸습니다.' };
  }

  // 게시 — 알림 fan-out은 아직 안 보낸 경우에만(중복 방지). 회원이 많아도 createMany 한 번.
  const shouldNotify = Boolean(cmd.notify) && announcement.notifiedAt == null;
  await prisma.$transaction(async (tx) => {
    await tx.announcement.update({
      where: { id: announcement.id },
      data: {
        publishedAt: new Date(),
        ...(shouldNotify ? { notifiedAt: new Date() } : {}),
      },
    });
    if (shouldNotify) {
      // 활성(승인·미정지·미탈퇴·미삭제) 회원 전원에게 SYSTEM 알림.
      const recipients = await tx.user.findMany({
        where: { approvedAt: { not: null }, suspendedAt: null, withdrawnAt: null, deletedAt: null },
        select: { id: true },
      });
      if (recipients.length > 0)
        await tx.notification.createMany({
          data: recipients.map((recipient) => ({
            type: 'SYSTEM' as const,
            title: '새 공지사항',
            body: announcement.title,
            linkUrl: '/',
            userId: recipient.id,
          })),
        });
    }
  });
  revalidatePath('/announcements');
  revalidatePath('/', 'layout');
  return {
    ok: true,
    data: undefined,
    message: shouldNotify ? '공지를 게시하고 회원에게 알림을 보냈습니다.' : '공지를 게시했습니다.',
  };
}
