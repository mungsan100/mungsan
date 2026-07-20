'use client';

import { useState, useTransition } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { createInquiryAction } from '../commands/create-inquiry.action';

export const InquiryForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createInquiryAction({ title, content });
      if (result.ok) {
        toast.success(result.message);
        setTitle('');
        setContent('');
      } else toast.error(result.message);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="inquiry-title">제목</Label>
        <Input
          id="inquiry-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="문의 제목"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inquiry-content">내용</Label>
        <Textarea
          id="inquiry-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          placeholder="불편한 점이나 궁금한 점을 자세히 적어 주세요."
          className="min-h-28"
        />
      </div>
      <Button type="submit" variant="brand" className="w-full" disabled={isPending}>
        {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
        문의 접수
      </Button>
    </form>
  );
};
