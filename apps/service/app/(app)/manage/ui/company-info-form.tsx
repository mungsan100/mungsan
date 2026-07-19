'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle, LuTriangleAlert } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

import { updateCompanyAction } from '../commands/update-company.action';
import type { IndustryOptionView, MyInfoView } from '../queries/my-info.query';

// 회사 정보 조회/수정 — 저장하면 즉시 재심사(가입심사중)로 전환되는 무거운 액션이라
// 수정 모드 진입 시 경고를 먼저 보여주고, 저장 성공 시 /pending 으로 보낸다
// (approvedAt 이 null 이 되는 순간 middleware 게이트가 어차피 그리로 보낸다).
export const CompanyInfoForm = ({
  company,
  industries,
}: {
  company: NonNullable<MyInfoView['company']>;
  industries: IndustryOptionView[];
}) => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(company.name);
  const [businessRegistrationNo, setBusinessRegistrationNo] = useState(
    company.businessRegistrationNo,
  );
  const [industryId, setIndustryId] = useState(company.industryId);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);

  function cancel() {
    setEditing(false);
    setError(null);
    setName(company.name);
    setBusinessRegistrationNo(company.businessRegistrationNo);
    setIndustryId(company.industryId);
  }

  function save() {
    startTransition(async () => {
      const result = await updateCompanyAction({ name, businessRegistrationNo, industryId });
      if (!result.ok) {
        setError({ field: result.field, message: result.message });
        return;
      }
      toast.success(result.message);
      // 재심사 전환 완료 — 게이트 목적지로 직접 이동(다음 내비게이션을 기다리지 않는다).
      router.push('/pending');
    });
  }

  if (!editing)
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-ink-900 text-sm font-bold">회사 정보</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-brand text-xs font-semibold underline underline-offset-2"
          >
            수정
          </button>
        </div>
        <dl className="space-y-1.5">
          <Row label="회사명" value={company.name} />
          <Row label="사업자등록번호" value={company.businessRegistrationNo} />
          <Row label="업종" value={company.industryName} />
        </dl>
        <p className="text-ink-400 text-xs">
          회사 정보를 수정하면 재심사가 필요해 가입심사중 상태로 전환됩니다.
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-ink-900 text-sm font-bold">회사 정보 수정</p>

      <div className="bg-warning/10 flex items-start gap-2 rounded-lg px-3 py-2.5">
        <LuTriangleAlert className="text-warning mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-ink-700 text-xs leading-relaxed">
          <span className="font-semibold">정보 수정으로 재심사가 필요합니다.</span> 저장하면 즉시
          가입심사중 상태로 전환되며, 운영팀 승인 완료까지 서비스 이용이 제한됩니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-name">회사명</Label>
        <Input id="company-name" value={name} onChange={(e) => setName(e.target.value)} />
        {error?.field === 'name' && <p className="text-danger text-xs">{error.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-brn">사업자등록번호</Label>
        <Input
          id="company-brn"
          value={businessRegistrationNo}
          onChange={(e) => setBusinessRegistrationNo(e.target.value)}
          placeholder="000-00-00000"
        />
        {error?.field === 'businessRegistrationNo' && (
          <p className="text-danger text-xs">{error.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-industry">업종</Label>
        <Select
          id="company-industry"
          value={industryId}
          onChange={(e) => setIndustryId(e.target.value)}
        >
          {industries.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.name}
            </option>
          ))}
        </Select>
        <p className="text-ink-400 text-xs">
          정확히 일치하는 업종이 없으면 가장 가까운 업종을 선택해 주세요.
        </p>
        {error?.field === 'industryId' && <p className="text-danger text-xs">{error.message}</p>}
      </div>
      {error && !error.field && <p className="text-danger text-xs">{error.message}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={cancel} disabled={isPending}>
          취소
        </Button>
        <Button type="button" variant="primary" onClick={save} disabled={isPending}>
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          저장하고 재심사 받기
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
