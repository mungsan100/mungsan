'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';

import { getAdminSession } from '@/lib/auth/session';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type ApproveSignupCommand = { userId: string };

// 가입 승인 — 미승인(approvedAt null) 건만. 반려됐던 건도 승인 가능(오반려 복구 경로 —
// 이때 반려 기록은 지운다). 사전조건을 where 에 실은 updateMany 로 중복 처리 레이스를 DB 에서 닫는다.
export async function approveSignupAction(cmd: ApproveSignupCommand): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, code: 'UNAUTHORIZED', message: '관리자 로그인이 필요합니다.' };

  // 사업자등록번호 중복 최종 방어(2026-07-20 보안 결정) — 심사 대기 중 같은 번호가 여러 건
  // 들어와도 "승인은 선착순 한 곳만". 이미 승인된 타 계정과 같은 번호면 승인을 거부한다.
  const targetCompany = await prisma.company.findUnique({
    where: { userId: cmd.userId },
    select: { businessRegistrationNo: true },
  });
  if (targetCompany) {
    const approvedDuplicate = await prisma.company.findFirst({
      where: {
        businessRegistrationNo: targetCompany.businessRegistrationNo,
        userId: { not: cmd.userId },
        user: { approvedAt: { not: null }, withdrawnAt: null, deletedAt: null },
      },
      select: { userId: true },
    });
    if (approvedDuplicate)
      return {
        ok: false,
        code: 'DUPLICATE_BRN',
        message: '같은 사업자등록번호로 이미 승인된 계정이 있습니다. 중복 신청 여부를 확인해 주세요.',
      };
  }

  // 승인 전이와 대상자 알림을 같은 트랜잭션으로(원자성) — 홈 의사결정 알림·벨에 노출된다.
  const approved = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: {
        id: cmd.userId,
        approvedAt: null,
        deletedAt: null,
        withdrawnAt: null,
        company: { isNot: null }, // 기업정보 없는 유저는 심사 대상 아님
      },
      data: { approvedAt: new Date(), rejectedAt: null, rejectedReason: null },
    });
    if (updated.count === 0) return false;

    await tx.notification.create({
      data: {
        type: 'MEMBERSHIP',
        title: '가입 심사가 승인됐어요',
        body: '뭉산의 모든 기능을 이용할 수 있어요. 협업 파트너를 찾아보세요.',
        linkUrl: '/',
        userId: cmd.userId,
      },
    });
    return true;
  });
  if (!approved)
    return { ok: false, code: 'NOT_APPROVABLE', message: '이미 승인됐거나 처리할 수 없는 신청입니다.' };

  revalidatePath('/approvals');
  revalidatePath(`/approvals/${cmd.userId}`);
  return { ok: true, data: undefined, message: '가입을 승인했습니다.' };
}
