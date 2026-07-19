'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import { hideContentAction, unhideContentAction } from '../commands/moderate-content.action';
import type { ContentRowView } from '../queries/contents.query';

// 콘텐츠 행 — 상태(공개/숨김·사유·처리자)와 액션(숨기기: 사유 입력 2단계 / 숨김 해제).
export const ContentRow = ({ content }: { content: ContentRowView }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [reason, setReason] = useState('');

  function hide() {
    startTransition(async () => {
      const result = await hideContentAction({
        kind: content.kind,
        contentId: content.id,
        reason,
      });
      if (result.ok) {
        toast.success(result.message);
        setShowReasonForm(false);
        setReason('');
      } else toast.error(result.message);
      router.refresh();
    });
  }

  function unhide() {
    startTransition(async () => {
      const result = await unhideContentAction({ kind: content.kind, contentId: content.id });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  const hidden = content.hiddenAt != null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{content.title}</p>
            {hidden ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                숨김
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                공개
              </span>
            )}
            {content.pendingReportCount > 0 && (
              <Link
                href="/reports"
                className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 hover:underline"
              >
                신고 {content.pendingReportCount}건 대기
              </Link>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{content.excerpt}</p>
          <p className="mt-1.5 text-xs text-slate-400">
            {content.authorLabel} · {formatKstDateTime(content.createdAt)}
          </p>
          {hidden && (
            <p className="mt-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">
              사유: {content.hiddenReason ?? '(기록 없음)'} · 처리:{' '}
              {content.hiddenByAdminName ?? '(미기록)'} ·{' '}
              {content.hiddenAt && formatKstDateTime(content.hiddenAt)}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {hidden ? (
            <button
              type="button"
              onClick={unhide}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {isPending && <LuLoaderCircle className="h-3.5 w-3.5 animate-spin" />}
              숨김 해제
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowReasonForm((v) => !v)}
              disabled={isPending}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              숨기기
            </button>
          )}
        </div>
      </div>

      {showReasonForm && !hidden && (
        <div className="mt-3 space-y-2 rounded-lg border border-red-100 bg-red-50 p-3">
          <label htmlFor={`reason-${content.id}`} className="text-xs font-semibold text-slate-700">
            숨김 사유 <span className="font-normal text-slate-400">(필수, 500자 이하)</span>
          </label>
          <textarea
            id={`reason-${content.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="예: 광고성 스팸 게시물"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReasonForm(false)}
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={hide}
              disabled={isPending || !reason.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
            >
              {isPending && <LuLoaderCircle className="h-3.5 w-3.5 animate-spin" />}
              숨김 확정
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
