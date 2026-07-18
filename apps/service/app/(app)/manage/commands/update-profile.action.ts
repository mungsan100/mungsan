'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mungsan/db';
import type { DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';

export type ActionResult<D = undefined> =
  | { ok: true; data: D; message: string }
  | { ok: false; code?: string; field?: string; message: string };

export type UpdateProfileCommand = {
  name: string;
  phone: string;
  executiveRole: DB.ExecutiveRole;
  jobTitle: string | null; // executiveRole == OTHER 일 때만 사용(user.prisma 컨벤션)
};

const ROLE_VALUES: DB.ExecutiveRole[] = [
  'CEO', 'COO', 'CTO', 'CFO', 'CMO', 'CISO', 'CPO', 'FOUNDER', 'CHAIRMAN', 'OTHER',
];

// 내 정보 수정 — 이름/연락처/직책. 이메일은 로그인 ID(unique)라 이 액션에서 다루지 않는다.
export async function updateProfileAction(cmd: UpdateProfileCommand): Promise<ActionResult> {
  const user = await getCurrentUser();

  const name = cmd.name.trim();
  const phone = cmd.phone.trim();
  if (!name) return { ok: false, field: 'name', message: '이름을 입력해 주세요.' };
  if (name.length > 50) return { ok: false, field: 'name', message: '이름은 50자 이내로 입력해 주세요.' };
  if (!phone) return { ok: false, field: 'phone', message: '연락처를 입력해 주세요.' };
  if (phone.length > 20) return { ok: false, field: 'phone', message: '연락처는 20자 이내로 입력해 주세요.' };
  if (!ROLE_VALUES.includes(cmd.executiveRole))
    return { ok: false, field: 'executiveRole', message: '직책을 선택해 주세요.' };

  const jobTitle = cmd.executiveRole === 'OTHER' ? cmd.jobTitle?.trim() || null : null;
  if (cmd.executiveRole === 'OTHER' && !jobTitle)
    return { ok: false, field: 'jobTitle', message: '직책을 입력해 주세요.' };

  await prisma.user.update({
    where: { id: user.id },
    data: { name, phone, executiveRole: cmd.executiveRole, jobTitle },
  });

  revalidatePath('/manage');
  revalidatePath('/');
  return { ok: true, data: undefined, message: '내 정보를 수정했습니다.' };
}
