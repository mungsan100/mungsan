import 'server-only';

import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

export type SignupAttachmentView = {
  id: string;
  kind: DB.AttachmentKind;
  fileName: string;
  mimeType: string | null;
  size: number | null;
};

export type CompanyRevisionView = {
  id: string;
  revisedAt: Date;
  nameBefore: string;
  nameAfter: string;
  businessRegistrationNoBefore: string;
  businessRegistrationNoAfter: string;
  industryNameBefore: string;
  industryNameAfter: string;
};

export type SignupDetailView = {
  userId: string;
  applicantName: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null;
  email: string;
  phone: string;
  signedUpAt: Date; // 회원가입 시각(User.createdAt)
  companyName: string;
  businessRegistrationNo: string;
  industryName: string;
  appliedAt: Date; // 기업정보 제출 시각(Company.createdAt)
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectedReason: string | null;
  attachments: SignupAttachmentView[];
  revisions: CompanyRevisionView[]; // 회사 정보 수정 이력(최신순) — 있으면 재심사 건
  // 같은 사업자등록번호를 쓰는 타 계정 현황(2026-07-20 중복 방지) — 승인 건이 있으면
  // 승인 액션이 거부하므로, 심사자가 상세에서 바로 알 수 있게 경고로 표시한다.
  brnDuplicates: { approvedCount: number; pendingCount: number };
};

// 가입 신청 단건 상세 — 신청자·기업 정보 + 해당 회사의 첨부 서류 전부.
// 기업정보 미제출 유저는 심사 대상이 아니므로 null.
export async function getSignupDetailQuery(userId: string): Promise<SignupDetailView | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, withdrawnAt: null },
    select: {
      id: true,
      name: true,
      executiveRole: true,
      jobTitle: true,
      email: true,
      phone: true,
      createdAt: true,
      approvedAt: true,
      rejectedAt: true,
      rejectedReason: true,
      company: {
        select: {
          id: true,
          name: true,
          businessRegistrationNo: true,
          createdAt: true,
          industry: { select: { name: true } },
        },
      },
    },
  });
  if (!user?.company) return null;

  // Attachment 는 무FK 폴리모픽 — ownerType+ownerId 로 직접 조회.
  const duplicateWhere = (approved: boolean) => ({
    businessRegistrationNo: user.company!.businessRegistrationNo,
    userId: { not: userId },
    user: {
      approvedAt: approved ? { not: null } : null,
      withdrawnAt: null,
      deletedAt: null,
    },
  });
  const [attachments, revisions, dupApproved, dupPending] = await Promise.all([
    prisma.attachment.findMany({
      where: { ownerType: 'COMPANY', ownerId: user.company.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, kind: true, fileName: true, mimeType: true, size: true },
    }),
    prisma.companyRevision.findMany({
      where: { companyId: user.company.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        nameBefore: true,
        nameAfter: true,
        businessRegistrationNoBefore: true,
        businessRegistrationNoAfter: true,
        industryNameBefore: true,
        industryNameAfter: true,
      },
    }),
    prisma.company.count({ where: duplicateWhere(true) }),
    prisma.company.count({ where: duplicateWhere(false) }),
  ]);

  return {
    userId: user.id,
    applicantName: user.name,
    executiveRole: user.executiveRole,
    jobTitle: user.jobTitle,
    email: user.email,
    phone: user.phone,
    signedUpAt: user.createdAt,
    companyName: user.company.name,
    businessRegistrationNo: user.company.businessRegistrationNo,
    industryName: user.company.industry.name,
    appliedAt: user.company.createdAt,
    status: user.approvedAt ? 'APPROVED' : user.rejectedAt ? 'REJECTED' : 'PENDING',
    approvedAt: user.approvedAt,
    rejectedAt: user.rejectedAt,
    rejectedReason: user.rejectedReason,
    attachments,
    revisions: revisions.map((revision) => ({
      id: revision.id,
      revisedAt: revision.createdAt,
      nameBefore: revision.nameBefore,
      nameAfter: revision.nameAfter,
      businessRegistrationNoBefore: revision.businessRegistrationNoBefore,
      businessRegistrationNoAfter: revision.businessRegistrationNoAfter,
      industryNameBefore: revision.industryNameBefore,
      industryNameAfter: revision.industryNameAfter,
    })),
    brnDuplicates: { approvedCount: dupApproved, pendingCount: dupPending },
  };
}
