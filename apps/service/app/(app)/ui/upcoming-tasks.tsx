import Link from 'next/link';
import { differenceInCalendarDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { LuChevronRight } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import {
  getHomeDerivedTasksQuery,
  type DerivedHomeTask,
} from '../queries/home-derived-tasks.query';
import { getHomeTasksQuery, type HomeTask } from '../queries/home-tasks.query';
import { UpcomingTaskCard, type TaskTone, type UpcomingTask } from './upcoming-task-card';

// 상태 → 배지 라벨. 표시 매핑이라 소비처(ui) 로컬. COMPLETED는 조회에서 제외돼 표시되지 않는다.
const STATUS_LABELS: Record<DB.TaskStatus, string> = {
  PLANNED: '예정',
  IN_PROGRESS: '진행',
  COMPLETED: '완료',
  ON_HOLD: '보류',
};

// 다가오는 할 일 — 셰르파 Task(기존) + 파생 할일(저장 공고 마감·응답 대기 제안·임시저장 제안,
// 결정 7)을 합성해 보여준다. 헤더(제목·개수·전체보기)까지 포함 — 개수가 동적이라 헤더를 이 안에 둔다.
export async function UpcomingTasks() {
  const user = await getCurrentUser();
  const [tasks, derived] = await Promise.all([
    getHomeTasksQuery(user.id),
    getHomeDerivedTasksQuery(user.id),
  ]);
  const now = new Date();
  const total = tasks.length + derived.length;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-ink-900 text-[17px] font-bold">다가오는 할 일</h2>
          {total > 0 && (
            <span className="bg-ink-100 text-ink-500 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-bold">
              {total}
            </span>
          )}
        </div>
        <Link href="/sherpa" className="text-ink-400 flex items-center gap-0.5 text-[13px]">
          전체보기
          <LuChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {total === 0 ? (
        <p className="text-ink-400 mt-3 text-sm">예정된 할 일이 없습니다.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {tasks.map((t) => (
            <UpcomingTaskCard key={t.id} task={toCard(t, now)} />
          ))}
          {derived.map((d) => (
            <UpcomingTaskCard key={d.key} task={toDerivedCard(d, now)} />
          ))}
        </div>
      )}
    </>
  );
}

// 파생 항목 → 카드. 출처(저장 공고/받은 제안/임시저장)를 배지로, D-2 이내면 danger 톤.
function toDerivedCard(d: DerivedHomeTask, now: Date): UpcomingTask {
  const daysLeft = d.dueDate ? kstCalendarDaysUntil(d.dueDate, now) : null;
  const tone: TaskTone = daysLeft != null && daysLeft <= 2 ? 'danger' : 'warning';
  const dday = daysLeft != null ? (daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`) : null;

  if (d.kind === 'SAVED_POST_DEADLINE')
    return {
      id: d.key,
      title: `저장한 공고 마감 ${dday}`,
      subtitle: d.postTitle,
      statusLabel: '저장 공고',
      tone,
      href: d.href,
    };
  if (d.kind === 'DRAFT_DEADLINE')
    return {
      id: d.key,
      title: `임시저장 제안 마감 ${dday}`,
      subtitle: `${d.postTitle} — 제출을 완료하세요`,
      statusLabel: '임시저장',
      tone,
      href: d.href,
    };
  return {
    id: d.key,
    title: `응답 대기 제안 ${d.count}건`,
    subtitle: d.postTitle,
    statusLabel: '받은 제안',
    tone: 'warning',
    href: d.href,
  };
}

// DB Task → 카드 표시 모델. 좌측 보더 색은 긴급도, 부제는 프로젝트명 · (마감 D-day 또는 갱신 상대시각).
function toCard(t: HomeTask, now: Date): UpcomingTask {
  const timing = t.dueDate ? formatDday(t.dueDate, now) : formatRelativeKorean(t.updatedAt);
  return {
    id: t.id,
    title: t.title,
    subtitle: `${t.projectTitle} · ${timing}`,
    statusLabel: STATUS_LABELS[t.status],
    tone: deriveTone(t, now),
  };
}

function deriveTone(t: HomeTask, now: Date): TaskTone {
  if (t.dueDate && kstCalendarDaysUntil(t.dueDate, now) <= 2) return 'danger';
  if (t.status === 'IN_PROGRESS') return 'warning';
  return 'success';
}

function formatDday(due: Date, now: Date): string {
  const days = kstCalendarDaysUntil(due, now);
  if (days === 0) return 'D-DAY';
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

// D-day·긴급도는 KST 달력 경계 기준. date-fns의 calendar-day는 서버 로컬 타임존을 쓰므로
// (Vercel=UTC) UTC 저장값을 KST로 환산한 뒤 일수 차를 구한다 — '표시할 때만 KST' 하드룰.
function kstCalendarDaysUntil(due: Date, now: Date): number {
  return differenceInCalendarDays(toZonedTime(due, 'Asia/Seoul'), toZonedTime(now, 'Asia/Seoul'));
}
