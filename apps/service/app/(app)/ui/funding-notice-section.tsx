import { differenceInCalendarDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { getCurrentUser } from '@/lib/auth/get-current-user';

import {
  getHomeSupportProgramsQuery,
  type HomeSupportProgram,
} from '../queries/home-support-programs.query';
import { FundingNoticeCard, type FundingNotice, type FundingNoticeTag } from './funding-notice-card';

// 마감 임박 기준(일) — 이 값 이내면 D-day 태그를 단다.
const DDAY_WINDOW = 14;

// AI 맞춤 사업 공고 섹션 — 내 회사 업종과 매칭한 지원사업을 조회해 카드로 렌더.
export async function FundingNoticeSection() {
  const user = await getCurrentUser();
  const programs = await getHomeSupportProgramsQuery(user.id);
  const now = new Date();

  if (programs.length === 0)
    return <p className="text-ink-400 text-sm">추천할 사업 공고가 없습니다.</p>;

  return (
    <div className="space-y-3">
      {programs.map((program) => (
        <FundingNoticeCard key={program.id} notice={toNotice(program, now)} />
      ))}
    </div>
  );
}

// SupportProgram 파생값 → 카드 표시 모델. 업종 적합·마감 임박 신호를 달고, 둘 다 없으면 검토 필요로 폴백.
function toNotice(program: HomeSupportProgram, now: Date): FundingNotice {
  const tags: FundingNoticeTag[] = [];
  if (program.industryMatched) tags.push({ label: '업종 적합', variant: 'fit' });

  const daysLeft = program.applicationEndDate
    ? kstCalendarDaysUntil(program.applicationEndDate, now)
    : null;
  if (daysLeft != null && daysLeft >= 0 && daysLeft <= DDAY_WINDOW)
    tags.push({ label: `D-${daysLeft}`, variant: 'dday' });

  if (tags.length === 0) tags.push({ label: '검토 필요', variant: 'review' });

  return {
    organization: program.organization,
    title: program.title,
    description: program.summary,
    matchRate: program.matchRate,
    tags,
  };
}

// 마감일까지 남은 KST 달력 일수 — UTC 저장값을 KST로 환산한 뒤 일수 차. '표시할 때만 KST'.
function kstCalendarDaysUntil(due: Date, now: Date): number {
  return differenceInCalendarDays(toZonedTime(due, 'Asia/Seoul'), toZonedTime(now, 'Asia/Seoul'));
}
