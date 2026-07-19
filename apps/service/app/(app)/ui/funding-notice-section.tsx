import { differenceInCalendarDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { SectionHeader } from '@/components/section-header';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { formatKst } from '@/lib/datetime/format-kst';

import {
  getHomeSupportProgramsQuery,
  type HomeSupportProgram,
} from '../queries/home-support-programs.query';
import { FundingNoticeCard, type FundingNotice, type FundingNoticeTag } from './funding-notice-card';

// 마감 임박 기준(일) — 이 값 이내면 D-day 태그를 단다.
const DDAY_WINDOW = 14;

// 홈 지원사업 2단 섹션 — "{이름}님 맞춤 지원사업"(적합도 추천) + "새로 올라온 지원사업"(최신 등록).
// 제목에 회원 이름이 들어가 섹션 헤더까지 이 컴포넌트가 렌더한다(page.tsx는 Suspense 셸만).
export async function FundingNoticeSection() {
  const user = await getCurrentUser();
  const { recommended, latest } = await getHomeSupportProgramsQuery(user.id);
  const now = new Date();

  return (
    <div className="space-y-5">
      <div>
        <SectionHeader
          title={`${user.name}님 맞춤 지원사업`}
          action={{ label: '전체보기', href: '/support' }}
        />
        <div className="mt-3 space-y-3">
          {recommended.length === 0 ? (
            <p className="text-ink-400 text-sm">추천할 지원사업 공고가 없습니다.</p>
          ) : (
            recommended.map((program) => (
              <FundingNoticeCard key={program.id} notice={toRecommendedNotice(program, now)} />
            ))
          )}
        </div>
      </div>

      <div>
        <SectionHeader title="새로 올라온 지원사업" />
        <div className="mt-3 space-y-3">
          {latest.length === 0 ? (
            <p className="text-ink-400 text-sm">새로 등록된 공고가 없습니다.</p>
          ) : (
            latest.map((program) => (
              <FundingNoticeCard key={program.id} notice={toLatestNotice(program, now)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 맞춤 추천 카드 — 업종 적합·마감 임박 신호를 달고, 둘 다 없으면 검토 필요로 폴백. 매칭률 링 표시.
function toRecommendedNotice(program: HomeSupportProgram, now: Date): FundingNotice {
  const tags = signalTags(program, now);
  if (tags.length === 0) tags.push({ label: '검토 필요', variant: 'review' });

  return {
    organization: program.organization,
    title: program.title,
    description: program.summary,
    matchRate: program.matchRate,
    registeredOn: null,
    tags,
    detailUrl: program.detailUrl,
  };
}

// 새 공고 카드 — 최신성이 핵심이라 매칭률 링 대신 등록일을 표시. 신호 태그는 있을 때만.
function toLatestNotice(program: HomeSupportProgram, now: Date): FundingNotice {
  return {
    organization: program.organization,
    title: program.title,
    description: program.summary,
    matchRate: null,
    registeredOn: `${formatKst(program.createdAt, 'M.d')} 등록`,
    tags: signalTags(program, now),
    detailUrl: program.detailUrl,
  };
}

// 두 단 공용 신호 태그 — 업종 명시 일치 + 마감 임박 D-day.
function signalTags(program: HomeSupportProgram, now: Date): FundingNoticeTag[] {
  const tags: FundingNoticeTag[] = [];
  if (program.industryMatched) tags.push({ label: '업종 적합', variant: 'fit' });

  const daysLeft = program.applicationEndDate
    ? kstCalendarDaysUntil(program.applicationEndDate, now)
    : null;
  if (daysLeft != null && daysLeft >= 0 && daysLeft <= DDAY_WINDOW)
    tags.push({ label: `D-${daysLeft}`, variant: 'dday' });

  return tags;
}

// 마감일까지 남은 KST 달력 일수 — UTC 저장값을 KST로 환산한 뒤 일수 차. '표시할 때만 KST'.
function kstCalendarDaysUntil(due: Date, now: Date): number {
  return differenceInCalendarDays(toZonedTime(due, 'Asia/Seoul'), toZonedTime(now, 'Asia/Seoul'));
}
