'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import type { DB } from '@mungsan/db';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatPhoneDisplay } from '@/lib/format/phone';

import { updateProfileAction } from '../commands/update-profile.action';
import type { MyInfoView } from '../queries/my-info.query';

// 임원 직책 → 표시 라벨. 표시 매핑이라 소비처(ui) 로컬(signup 폼과 동일 사전).
const EXECUTIVE_ROLE_LABELS: Record<DB.ExecutiveRole, string> = {
  CEO: '대표이사(CEO)',
  COO: '최고운영책임자(COO)',
  CTO: '최고기술책임자(CTO)',
  CFO: '최고재무책임자(CFO)',
  CMO: '최고마케팅책임자(CMO)',
  CISO: '최고정보보안책임자(CISO)',
  CPO: '최고제품책임자(CPO)',
  FOUNDER: '창업자',
  CHAIRMAN: '의장/회장',
  OTHER: '기타(직접 입력)',
};
const ROLE_VALUES = Object.keys(EXECUTIVE_ROLE_LABELS) as DB.ExecutiveRole[];

// 개인정보 조회/수정 — 조회 모드에서 [수정]을 누르면 인라인 폼으로 전환.
// 이메일은 로그인 ID(unique)라 수정 불가로 표기만 한다.
export const MyInfoForm = ({ info }: { info: MyInfoView }) => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(info.name);
  const [phone, setPhone] = useState(info.phone);
  const [executiveRole, setExecutiveRole] = useState<DB.ExecutiveRole>(info.executiveRole);
  const [jobTitle, setJobTitle] = useState(info.jobTitle ?? '');
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);

  function cancel() {
    setEditing(false);
    setError(null);
    setName(info.name);
    setPhone(info.phone);
    setExecutiveRole(info.executiveRole);
    setJobTitle(info.jobTitle ?? '');
  }

  function save() {
    startTransition(async () => {
      const result = await updateProfileAction({
        name,
        phone,
        executiveRole,
        jobTitle: jobTitle.trim() || null,
      });
      if (!result.ok) {
        setError({ field: result.field, message: result.message });
        return;
      }
      toast.success(result.message);
      setEditing(false);
      setError(null);
      router.refresh();
    });
  }

  const roleLabel =
    info.executiveRole === 'OTHER' && info.jobTitle
      ? info.jobTitle
      : EXECUTIVE_ROLE_LABELS[info.executiveRole];

  if (!editing)
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-ink-900 text-sm font-bold">개인정보</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-brand text-xs font-semibold underline underline-offset-2"
          >
            수정
          </button>
        </div>
        <dl className="space-y-1.5">
          <Row label="이름" value={info.name} />
          {/* 저장값이 하이픈 유무 어느 쪽이든 000-0000-0000로 통일 표시(기존 회원 포함). */}
          <Row label="연락처" value={formatPhoneDisplay(info.phone)} />
          <Row label="이메일" value={`${info.email} (로그인 계정 — 변경 불가)`} />
          <Row label="직책" value={roleLabel} />
        </dl>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-ink-900 text-sm font-bold">개인정보 수정</p>
      <div className="space-y-2">
        <Label htmlFor="my-name">이름</Label>
        <Input id="my-name" value={name} onChange={(e) => setName(e.target.value)} />
        {error?.field === 'name' && <p className="text-danger text-xs">{error.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="my-phone">연락처</Label>
        <Input id="my-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {error?.field === 'phone' && <p className="text-danger text-xs">{error.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="my-role">직책</Label>
        <Select
          id="my-role"
          value={executiveRole}
          onChange={(e) => setExecutiveRole(e.target.value as DB.ExecutiveRole)}
        >
          {ROLE_VALUES.map((value) => (
            <option key={value} value={value}>
              {EXECUTIVE_ROLE_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>
      {executiveRole === 'OTHER' && (
        <div className="space-y-2">
          <Label htmlFor="my-jobtitle">직책 직접 입력</Label>
          <Input
            id="my-jobtitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="예: 부사장"
          />
          {error?.field === 'jobTitle' && <p className="text-danger text-xs">{error.message}</p>}
        </div>
      )}
      {error && !error.field && <p className="text-danger text-xs">{error.message}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={cancel} disabled={isPending}>
          취소
        </Button>
        <Button type="button" variant="primary" onClick={save} disabled={isPending}>
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          저장
        </Button>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <dt className="text-ink-400 w-28 shrink-0 text-sm">{label}</dt>
    <dd className="text-ink-900 text-sm break-all">{value}</dd>
  </div>
);
