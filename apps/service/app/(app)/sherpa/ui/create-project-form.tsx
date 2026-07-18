'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LuLoaderCircle, LuPlus } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createProjectAction } from '../commands/create-project.action';

// 프로젝트가 없을 때 노출되는 최소 생성 폼(제목만). 생성 후 refresh로 할 일 섹션이 열린다.
export const CreateProjectForm = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function create() {
    if (!title.trim()) {
      setError('프로젝트 이름을 입력해 주세요.');
      return;
    }
    startTransition(async () => {
      const result = await createProjectAction({ title });
      if (!result.ok) {
        if (result.field === 'title') setError(result.message);
        else toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          placeholder="프로젝트 이름 (예: 신제품 공동 마케팅)"
          maxLength={80}
        />
        <Button
          type="button"
          variant="primary"
          onClick={create}
          disabled={isPending}
          className="shrink-0"
        >
          {isPending ? (
            <LuLoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <LuPlus className="h-4 w-4" />
          )}
          만들기
        </Button>
      </div>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
};
