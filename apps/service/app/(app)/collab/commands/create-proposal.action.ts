'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import { putFile } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { isDeadlinePassed } from '@/lib/collab/deadline';

import { composeProposalMessage, validateProposalFields, type ProposalFields } from '../domain/proposal-fields';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateProposalCommand = { postId: string; attachments?: File[] } & ProposalFields;

// 참고 자료 첨부 정책 — 공고 첨부(create-collab-post)와 동일: 최대 3개·개당 5MB·PDF/이미지.
const MAX_ATTACHMENTS = 3;
const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// 제안 제출 — 구조화 5필드(자기소개/관심이유/기여역량/협업방식/미팅일정, PRD FR-CLBMK-3) + 역할
// + 참고 자료 첨부(선택, 다중). 소개서 read-time 조회 방식은 제거하고 제안 시점 첨부로 대체(#결정).
// message 에는 필드를 합친 전문을 저장해 기존 화면(받은 제안 카드·스냅샷)과 호환한다.
// 같은 공고에 임시저장(DRAFT)이 있으면 삭제하고 새 SUBMITTED 로 제출한다(제출 시점 = createdAt).
// 임시저장에는 파일이 포함되지 않는다 — 첨부는 제출 시에만 업로드된다.
export async function createProposalAction(cmd: CreateProposalCommand): Promise<ActionResult> {
  const user = await getCurrentUser(); // 1. 인증

  const validated = validateProposalFields(cmd, { requireCore: true });
  if (!validated.ok) return { ok: false, field: validated.field, message: validated.message };
  const fields = validated.fields;

  const attachments = cmd.attachments ?? [];
  if (attachments.length > MAX_ATTACHMENTS)
    return { ok: false, field: 'attachments', message: `참고 자료는 최대 ${MAX_ATTACHMENTS}개까지 첨부할 수 있습니다.` };
  for (const file of attachments) {
    if (file.size === 0) return { ok: false, field: 'attachments', message: '빈 파일은 첨부할 수 없습니다.' };
    if (file.size > ATTACHMENT_MAX_BYTES)
      return { ok: false, field: 'attachments', message: '참고 자료는 개당 5MB 이하여야 합니다.' };
    if (!ATTACHMENT_TYPES.includes(file.type))
      return { ok: false, field: 'attachments', message: 'PDF 또는 이미지 파일만 첨부할 수 있습니다.' };
  }

  const post = await prisma.collaborationPost.findFirst({
    where: { id: cmd.postId, isPublic: true, deletedAt: null, hiddenAt: null },
    select: { id: true, title: true, authorId: true, applicationDeadline: true },
  }); // 2. 로드
  if (!post) return { ok: false, code: 'NOT_FOUND', message: '공고를 찾을 수 없습니다.' };

  // 3. 인가 — 본인 공고에는 제안 불가, 마감된 공고에는 새 제안 불가
  if (post.authorId === user.id)
    return { ok: false, code: 'OWN_POST', message: '내가 올린 공고에는 제안할 수 없습니다.' };
  if (isDeadlinePassed(post.applicationDeadline))
    return { ok: false, code: 'DEADLINE_PASSED', message: '마감된 공고에는 제안할 수 없습니다.' };

  // 4. 중복 제출 방지 — 이미 제출한(미DRAFT) 제안이 있으면 거부
  const existing = await prisma.collaborationProposal.findFirst({
    where: { postId: post.id, proposerId: user.id, status: { not: 'DRAFT' } },
    select: { id: true },
  });
  if (existing)
    return { ok: false, code: 'ALREADY_PROPOSED', message: '이미 이 공고에 제안을 보냈습니다.' };

  // 5. 참고 자료 업로드 — 검증·중복 확인이 끝난 뒤에 올려 고아 blob을 줄인다.
  //    스토어가 private-only라 blob 레벨은 전부 private, 열람은 서명 URL 경유.
  const uploaded = await Promise.all(
    attachments.map(async (file) => ({
      file,
      blob: await putFile(uploadPathname(file), file, { access: 'private', contentType: file.type }),
    })),
  );

  // 6. 영속화(임시저장 삭제 + 제안 생성 + 참고 자료 + 제안수 캐시 증가) + 무효화. status 명시(컨벤션).
  await prisma.$transaction(async (tx) => {
    await tx.collaborationProposal.deleteMany({
      where: { postId: post.id, proposerId: user.id, status: 'DRAFT' },
    });
    const proposal = await tx.collaborationProposal.create({
      data: {
        postId: post.id,
        proposerId: user.id,
        message: composeProposalMessage(fields),
        ...fields,
        status: 'SUBMITTED',
      },
      select: { id: true },
    });
    if (uploaded.length > 0)
      await tx.attachment.createMany({
        data: uploaded.map(({ file, blob }) => ({
          ownerType: 'COLLABORATION_PROPOSAL' as const,
          ownerId: proposal.id,
          kind: 'PROPOSAL_ATTACHMENT' as const,
          access: 'MEMBER' as const,
          pathname: blob.pathname,
          fileName: file.name,
          mimeType: blob.contentType,
          size: file.size,
        })),
      });
    await tx.collaborationPost.update({
      where: { id: post.id },
      data: { proposalCount: { increment: 1 } },
    });
    // 공고 작성자에게 제안 수신 알림 — 본 작업과 같은 트랜잭션(원자성). 홈 의사결정 알림·벨에 노출.
    const proposerCompany = await tx.company.findUnique({
      where: { userId: user.id },
      select: { name: true },
    });
    await tx.notification.create({
      data: {
        type: 'COLLABORATION',
        title: '새 협업 제안이 도착했어요',
        body: `'${post.title}' 공고에 ${proposerCompany?.name ?? user.name}의 제안이 도착했습니다.`,
        linkUrl: '/manage',
        userId: post.authorId,
      },
    });
  });
  revalidatePath(`/collab/${post.id}`);
  revalidatePath('/collab');
  return { ok: true, data: undefined, message: '제안을 보냈습니다.' };
}

function uploadPathname(file: File): string {
  const dot = file.name.lastIndexOf('.');
  const ext = dot > 0 ? file.name.slice(dot).toLowerCase() : '';
  return `${randomUUID()}${ext}`;
}
