import { LuMegaphone } from 'react-icons/lu';

import { Card } from '@/components/ui/card';
import { formatKst } from '@/lib/datetime/format-kst';

import { getHomeAnnouncementsQuery } from '../queries/home-announcements.query';

// 홈 공지 배너(2026-07-20, 4-1 B안) — 게시된 공지가 있을 때만 렌더. 없으면 아무것도 안 보인다.
export async function AnnouncementBanner() {
  const announcements = await getHomeAnnouncementsQuery();
  if (announcements.length === 0) return null;

  return (
    <section className="px-5">
      <div className="space-y-2">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="bg-brand-soft border-none p-4">
            <div className="flex items-start gap-2.5">
              <LuMegaphone className="text-brand mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-ink-900 text-[14px] font-bold">{announcement.title}</h3>
                  <span className="text-ink-400 shrink-0 text-[11px]">
                    {formatKst(announcement.publishedAt, 'M.d')}
                  </span>
                </div>
                <p className="text-ink-600 mt-1 text-[13px] leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
