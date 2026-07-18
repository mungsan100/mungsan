'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import { putFile } from '@mungsan/file/server';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import { CollaborationPost } from '../domain/collaboration-post';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type CreateCollabPostCommand = {
  title: string;
  description: string;
  minBudgetInCheonwon: number | null;
  maxBudgetInCheonwon: number | null;
  region: string | null;
  collaborationMethod: string | null;
  startDate: Date | null;
  endDate: Date | null;
  applicationDeadline: Date | null;
  requiredSkillIds: string[];
  industryTagIds: string[];
  isPublic: boolean;
  attachments: File[]; // 공고 첨부(선택, 최대 3개)
};

const MAX_ATTACHMENTS = 3;
const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024; // 5MB — 서버액션 본문 한도(12MB) 안에서 3개까지 수용
const ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export async function createCollabPostAction(
  cmd: CreateCollabPostCommand,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser(); // 1. 인증

  // 2. 불변식 검증 (domain)
  const result = CollaborationPost.create({
    title: cmd.title,
    description: cmd.description,
    minBudgetInCheonwon: cmd.minBudgetInCheonwon,
    maxBudgetInCheonwon: cmd.maxBudgetInCheonwon,
    region: cmd.region,
    collaborationMethod: cmd.collaborationMethod,
    startDate: cmd.startDate,
    endDate: cmd.endDate,
    applicationDeadline: cmd.applicationDeadline,
    requiredSkillIds: cmd.requiredSkillIds,
    industryTagIds: cmd.industryTagIds,
  });
  if (result.isErr())
    return { ok: false, code: result.error.code, field: fieldOf(result.error.code), message: result.error.message };
  const post = result.value;

  // 3. 첨부 검증 (개수/크기/타입)
  const attachments = cmd.attachments ?? [];
  if (attachments.length > MAX_ATTACHMENTS)
    return { ok: false, field: 'attachments', message: `첨부는 최대 ${MAX_ATTACHMENTS}개까지 가능합니다.` };
  for (const file of attachments) {
    if (file.size === 0) return { ok: false, field: 'attachments', message: '빈 파일은 첨부할 수 없습니다.' };
    if (file.size > ATTACHMENT_MAX_BYTES)
      return { ok: false, field: 'attachments', message: '첨부파일은 개당 5MB 이하여야 합니다.' };
    if (!ATTACHMENT_TYPES.includes(file.type))
      return { ok: false, field: 'attachments', message: 'PDF 또는 이미지 파일만 첨부할 수 있습니다.' };
  }

  // 4. 파일 업로드 — 스토어가 private-only라 blob 레벨은 전부 private, 열람은 서명 URL 경유.
  const uploaded = await Promise.all(
    attachments.map(async (file) => ({
      file,
      blob: await putFile(uploadPathname(file), file, { access: 'private', contentType: file.type }),
    })),
  );

  // 5. 영속화 + 무효화. @default 유무와 무관하게 카운트 0을 명시한다(비즈니스 필드 명시 원칙).
  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.collaborationPost.create({
      data: {
        title: post.title,
        description: post.description,
        minBudgetInCheonwon: post.minBudgetInCheonwon,
        maxBudgetInCheonwon: post.maxBudgetInCheonwon,
        region: post.region,
        collaborationMethod: post.collaborationMethod,
        startDate: post.startDate,
        endDate: post.endDate,
        applicationDeadline: post.applicationDeadline,
        requiredSkillIds: post.requiredSkillIds,
        industryTagIds: post.industryTagIds,
        authorId: user.id,
        isPublic: cmd.isPublic,
        viewCount: 0,
        proposalCount: 0,
        bookmarkCount: 0,
      },
      select: { id: true },
    });

    if (uploaded.length > 0)
      await tx.attachment.createMany({
        data: uploaded.map(({ file, blob }) => ({
          ownerType: 'COLLABORATION_POST' as const,
          ownerId: row.id,
          kind: 'POST_ATTACHMENT' as const,
          access: 'MEMBER' as const,
          pathname: blob.pathname,
          fileName: file.name,
          mimeType: blob.contentType,
          size: file.size,
        })),
      });

    return row;
  });

  revalidatePath('/collab');
  return { ok: true, data: { id: created.id }, message: '공고를 등록했습니다.' };
}

function uploadPathname(file: File): string {
  const dot = file.name.lastIndexOf('.');
  const ext = dot > 0 ? file.name.slice(dot).toLowerCase() : '';
  return `${randomUUID()}${ext}`;
}

// 도메인 에러코드 → 폼 필드 매핑. 예산 오류는 최대 예산 입력에 표시(폼도 min<=max를 선검증).
function fieldOf(code: string): string | undefined {
  switch (code) {
    case 'TITLE_REQUIRED':
      return 'title';
    case 'DESCRIPTION_REQUIRED':
      return 'description';
    case 'BUDGET_NEGATIVE':
    case 'BUDGET_RANGE':
      return 'maxBudgetInCheonwon';
    case 'DEADLINE_PAST':
      return 'applicationDeadline';
    default:
      return undefined;
  }
}
