'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import { resolveInquiryAction } from '../commands/resolve-inquiry.action';
import type { InquiryListItem } from '../queries/inquiries.query';

export const InquiryRow = ({ inquiry }: { inquiry: InquiryListItem }) => {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState('');
  const [isPending, startTransition] = useTransition();
  const resolved = inquiry.resolvedAt != null;

  function resolve() {
    startTransition(async () => {
      const result = await resolveInquiryAction({ inquiryId: inquiry.id, note: note.trim() || undefined });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      setResolving(false);
      router.refresh();
    });
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">{inquiry.title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {inquiry.authorName}
            {inquiry.companyName && ` · ${inquiry.companyName}`} · {inquiry.authorEmail} ·{' '}
            {formatKstDateTime(inquiry.createdAt)}
          </p>
        </div>
        {resolved && (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            처리 완료
          </span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {inquiry.content}
      </p>

      {/* 답변은 회원 가입 이메일로 직접 발송(운영). 여기서는 내부 처리 메모만 기록. */}
      {resolved ? (
        inquiry.adminNote && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            처리 메모: {inquiry.adminNote}
          </p>
        )
      ) : resolving ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="처리 메모 (선택) — 내부 기록용"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResolving(false)}
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={resolve}
              disabled={isPending}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              처리 완료
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <a
            href={`mailto:${inquiry.authorEmail}?subject=${encodeURIComponent(`[뭉산] 문의 답변: ${inquiry.title}`)}`}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            이메일로 답변
          </a>
          <button
            type="button"
            onClick={() => setResolving(true)}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
          >
            처리 완료 표시
          </button>
        </div>
      )}
    </li>
  );
};
