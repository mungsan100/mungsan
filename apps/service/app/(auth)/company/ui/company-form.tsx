'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuFileText, LuLoaderCircle, LuUpload } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { callAction } from '@/lib/forms/call-action';
import { registerCompanyAction } from '@/app/(auth)/company/commands/register-company.action';
import type { IndustryOption } from '@/app/(auth)/company/queries/industries.query';

// 서버 액션 본문 한도(next.config bodySizeLimit) 안에서 안전하도록 제출 전에 크기를 막는다 —
// 한도 초과 시 서버가 요청을 즉시 끊어(400) 사용자에겐 무반응으로 보이기 때문.
// 값·형식은 register-company.action의 서버 검증(MAX_BYTES·ALLOWED_TYPES)과 동일하게 유지할 것.
const FILE_MAX_MB = 10;
const FILE_MAX_BYTES = FILE_MAX_MB * 1024 * 1024;
const FILE_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';
const FILE_NOTICE = `PDF 또는 이미지(JPG·PNG·WebP) · 최대 ${FILE_MAX_MB}MB`;

const fileSchema = z
  .instanceof(File, { error: '파일을 첨부해 주세요.' })
  .refine((f) => f.size > 0, '파일을 첨부해 주세요.')
  .refine((f) => f.size <= FILE_MAX_BYTES, `파일 크기는 ${FILE_MAX_MB}MB 이하여야 합니다.`);

const schema = z.object({
  name: z.string().trim().min(1, '회사명을 입력해 주세요.'),
  businessRegistrationNo: z.string().trim().min(1, '사업자등록번호를 입력해 주세요.'),
  industryId: z.string().min(1, '업종을 선택해 주세요.'),
  businessCertFile: fileSchema,
  brochureFile: fileSchema,
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export const CompanyForm = ({ industries }: { industries: IndustryOption[] }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      businessRegistrationNo: '',
      industryId: '',
      businessCertFile: undefined as unknown as File,
      brochureFile: undefined as unknown as File,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await callAction(
      () => registerCompanyAction(values),
      '등록 요청에 실패했습니다. 파일이 너무 크거나 네트워크 문제일 수 있어요.',
    );
    if (result === null) return;
    if (!result.ok) {
      if (
        result.field === 'name' ||
        result.field === 'businessRegistrationNo' ||
        result.field === 'industryId' ||
        result.field === 'businessCertFile' ||
        result.field === 'brochureFile'
      )
        setError(result.field, { message: result.message });
      else toast.error(result.message);
      return;
    }
    // 성공 시 registerCompanyAction 내부에서 redirect('/')가 실행된다.
    setIsRedirecting(true);
  });

  const busy = isSubmitting || isRedirecting;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">회사명</Label>
        <Input id="name" {...register('name')} placeholder="주식회사 뭉산" />
        {errors.name && <p className="text-danger text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessRegistrationNo">사업자등록번호</Label>
        <Input
          id="businessRegistrationNo"
          {...register('businessRegistrationNo')}
          placeholder="000-00-00000"
        />
        {errors.businessRegistrationNo && (
          <p className="text-danger text-xs">{errors.businessRegistrationNo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industryId">업종</Label>
        <Select id="industryId" {...register('industryId')} defaultValue="">
          <option value="" disabled>
            업종을 선택해 주세요
          </option>
          {industries.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.name}
            </option>
          ))}
        </Select>
        {errors.industryId && <p className="text-danger text-xs">{errors.industryId.message}</p>}
      </div>

      <Controller
        control={control}
        name="businessCertFile"
        render={({ field: { onChange, name, onBlur, ref, value } }) => (
          <FileDropField
            id="businessCertFile"
            label="사업자등록증"
            file={value}
            error={errors.businessCertFile?.message}
            name={name}
            inputRef={ref}
            onBlur={onBlur}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="brochureFile"
        render={({ field: { onChange, name, onBlur, ref, value } }) => (
          <FileDropField
            id="brochureFile"
            label="회사 소개서"
            file={value}
            error={errors.brochureFile?.message}
            name={name}
            inputRef={ref}
            onBlur={onBlur}
            onChange={onChange}
          />
        )}
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        등록하기
      </Button>
    </form>
  );
};

// 파일 첨부 박스 — 경계가 뚜렷한 드롭존 스타일(클릭 영역 전체가 파일 선택 트리거).
// 실제 input은 sr-only로 숨기고 label 박스가 클릭·포커스 표면을 담당한다.
const FileDropField = ({
  id,
  label,
  file,
  error,
  name,
  inputRef,
  onBlur,
  onChange,
}: {
  id: string;
  label: string;
  file: File | undefined;
  error: string | undefined;
  name: string;
  inputRef: React.Ref<HTMLInputElement>;
  onBlur: () => void;
  onChange: (file: File | undefined) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <label
      htmlFor={id}
      className={`block cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 transition-colors ${
        error
          ? 'border-danger/60 bg-danger/5'
          : 'border-ink-300 bg-ink-50 hover:border-ink-400 hover:bg-ink-100 focus-within:border-brand'
      }`}
    >
      <input
        id={id}
        name={name}
        ref={inputRef}
        type="file"
        accept={FILE_ACCEPT}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.files?.[0])}
        className="sr-only"
      />
      {file ? (
        <span className="flex items-center justify-center gap-2">
          <LuFileText className="text-ink-600 h-5 w-5 shrink-0" />
          <span className="min-w-0 text-left">
            <span className="text-ink-900 block truncate text-sm font-semibold">{file.name}</span>
            <span className="text-ink-500 block text-xs">
              {formatFileSize(file.size)} · 눌러서 다른 파일로 변경
            </span>
          </span>
        </span>
      ) : (
        <span className="flex flex-col items-center gap-1 text-center">
          <LuUpload className="text-ink-400 h-6 w-6" />
          <span className="text-ink-700 text-sm font-semibold">여기를 눌러 파일 첨부</span>
          <span className="text-ink-500 text-xs">{FILE_NOTICE}</span>
        </span>
      )}
    </label>
    {error && <p className="text-danger text-xs">{error}</p>}
  </div>
);

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}
