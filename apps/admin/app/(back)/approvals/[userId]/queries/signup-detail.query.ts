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
  const attachments = await prisma.attachment.findMany({
    where: { ownerType: 'COMPANY', ownerId: user.company.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, kind: true, fileName: true, mimeType: true, size: true },
  });

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
  };
}
