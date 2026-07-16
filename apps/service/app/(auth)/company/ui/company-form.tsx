'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

import { registerCompanyAction } from '../commands/register-company.action';
import type { IndustryOption } from '../queries/industries.query';

const fileSchema = z
  .instanceof(File, { error: '파일을 첨부해 주세요.' })
  .refine((f) => f.size > 0, '파일을 첨부해 주세요.');

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
    const result = await registerCompanyAction(values);
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
        render={({ field: { onChange, name, onBlur, ref } }) => (
          <div className="space-y-2">
            <Label htmlFor="businessCertFile">사업자등록증</Label>
            <input
              id="businessCertFile"
              name={name}
              ref={ref}
              type="file"
              accept="application/pdf,image/*"
              onBlur={onBlur}
              onChange={(e) => onChange(e.target.files?.[0])}
              className="text-ink-600 w-full text-sm"
            />
            {errors.businessCertFile && (
              <p className="text-danger text-xs">{errors.businessCertFile.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="brochureFile"
        render={({ field: { onChange, name, onBlur, ref } }) => (
          <div className="space-y-2">
            <Label htmlFor="brochureFile">회사 소개서</Label>
            <input
              id="brochureFile"
              name={name}
              ref={ref}
              type="file"
              accept="application/pdf,image/*"
              onBlur={onBlur}
              onChange={(e) => onChange(e.target.files?.[0])}
              className="text-ink-600 w-full text-sm"
            />
            {errors.brochureFile && <p className="text-danger text-xs">{errors.brochureFile.message}</p>}
          </div>
        )}
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
        등록하기
      </Button>
    </form>
  );
};
