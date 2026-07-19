import { differenceInCalendarDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { LuExternalLink } from 'react-icons/lu';

import { cn } from '@/lib/utils';

import type { SupportProgramListItem } from '../queries/support-programs.query';

// 마감 임박 기준(일) — 홈 카드와 동일 값.
const DDAY_WINDOW = 14;

// 지원사업 목록 행 — 기관·제목·요약·태그(D-day/업종/AI 요약)와 매칭률.
// 원문 링크(수집 공고)가 있으면 행 전체가 새 탭 링크.
export const SupportProgramRow = ({ program }: { program: SupportProgramListItem }) => {
  const daysLeft = program.applicationEndDate
    ? kstCalendarDaysUntil(program.applicationEndDate, new Date())
    : null;

  const body = (
    <div className="shadow-card rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-ink-400 text-[11px] font-semibold">{program.organization}</p>
          <h3 className="text-ink-900 mt-0.5 text-[15px] leading-snug font-bold">
            {program.title}
            {program.detailUrl && (
              <LuExternalLink className="text-ink-300 ml-1 inline h-3.5 w-3.5 align-[-1px]" />
            )}
          </h3>
          <p className="text-ink-400 mt-1 line-clamp-2 text-[13px] leading-relaxed">
            {program.summary}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-brand-sub01 text-lg font-bold tabular-nums">{program.matchRate}%</p>
          <p className="text-ink-400 text-[11px]">매칭률</p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {daysLeft != null && daysLeft >= 0 && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-semibold',
              daysLeft <= DDAY_WINDOW ? 'bg-brand-sub02 text-white' : 'bg-ink-100 text-ink-600',
            )}
          >
            D-{daysLeft}
          </span>
        )}
        {program.industryMatched && (
          <span className="bg-brand-soft text-brand-sub02 rounded-full px-2 py-0.5 text-[11px] font-semibold">
            업종 적합
          </span>
        )}
        <span className="text-ink-500 rounded-full px-0.5 text-[11px]">
          {program.industryNames.length > 0 ? program.industryNames.join(' · ') : '전 업종'}
          {program.region && ` · ${program.region}`}
        </span>
        {program.hasAiSummary && (
          <span className="bg-ink-100 text-ink-600 rounded-full px-2 py-0.5 text-[11px] font-semibold">
            AI 요약
          </span>
        )}
      </div>
    </div>
  );

  if (!program.detailUrl) return body;
  return (
    <a href={program.detailUrl} target="_blank" rel="noopener noreferrer" className="block">
      {body}
    </a>
  );
};

// 마감일까지 남은 KST 달력 일수 — UTC 저장값을 KST로 환산한 뒤 일수 차('표시할 때만 KST').
function kstCalendarDaysUntil(due: Date, now: Date): number {
  return differenceInCalendarDays(toZonedTime(due, 'Asia/Seoul'), toZonedTime(now, 'Asia/Seoul'));
}
