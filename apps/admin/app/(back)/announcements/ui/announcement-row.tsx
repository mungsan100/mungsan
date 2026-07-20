'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { formatKstDateTime } from '@/lib/datetime/format-kst';

import { setAnnouncementPublishedAction } from '../commands/announcement.action';
import type { AnnouncementListItem } from '../queries/announcements.query';

export const AnnouncementRow = ({ announcement }: { announcement: AnnouncementListItem }) => {
  const router = useRouter();
  const [notify, setNotify] = useState(announcement.notifiedAt == null);
  const [isPending, startTransition] = useTransition();
  const published = announcement.publishedAt != null;

  function toggle(publish: boolean) {
    startTransition(async () => {
      const result = await setAnnouncementPublishedAction({
        announcementId: announcement.id,
        publish,
        notify: publish ? notify : undefined,
      });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">{announcement.title}</h2>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {published ? '게시 중' : '미게시'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            작성 {formatKstDateTime(announcement.createdAt)}
            {announcement.notifiedAt && ' · 알림 발송됨'}
          </p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {announcement.content}
      </p>
      <div className="mt-3 flex items-center gap-3">
        {published ? (
          <button
            type="button"
            onClick={() => toggle(false)}
            disabled={isPending}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            내리기
          </button>
        ) : (
          <>
            {announcement.notifiedAt == null && (
              <label className="flex items-center gap-1.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                알림으로도 보내기
              </label>
            )}
            <button
              type="button"
              onClick={() => toggle(true)}
              disabled={isPending}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              게시
            </button>
          </>
        )}
      </div>
    </li>
  );
};
