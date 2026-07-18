import { differenceInCalendarYears } from 'date-fns';
import { notFound } from 'next/navigation';
import {
  LuBadgeCheck,
  LuBookmark,
  LuCalendar,
  LuCoins,
  LuGlobe,
  LuHandshake,
  LuMapPin,
  LuMessageCircle,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';

import { ReportButton } from '@/components/report-button';
import { isDeadlinePassed } from '@/lib/collab/deadline';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { formatKst } from '@/lib/datetime/format-kst';

import { getCollabDetailQuery } from '../../queries/collab-detail.query';
import { AttachmentList } from './attachment-list';
import { DetailBookmarkButton } from './detail-bookmark-button';
import { ProposalForm } from './proposal-form';
import { ViewCounter } from './view-counter';

export const CollabDetailContent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const detail = await getCollabDetailQuery({ postId: id, userId: user.id });
  if (!detail) notFound();

  const budget = formatBudget(detail.minBudgetInCheonwon, detail.maxBudgetInCheonwon);
  const period = formatPeriod(detail.startDate, detail.endDate);
  // 공고 기업 프로필 지표 — 지역·업력·인원 중 공개된 것만(목록 카드와 파리티).
  const companyStats = [
    detail.companyRegion,
    formatYearsInBusiness(detail.companyFoundedDate),
    detail.companyHeadcount != null ? `${detail.companyHeadcount}명` : null,
  ].filter((x): x is string => !!x);

  return (
    <div className="space-y-4">
      {/* 상세 콘텐츠와 함께 렌더 — 유효한 공고(notFound 통과)에서만 조회수 1회 증가 */}
      <ViewCounter postId={detail.postId} />
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-ink-900 text-xl font-bold leading-snug">{detail.title}</h2>
          <div className="flex shrink-0 items-center gap-2.5">
            <ReportButton targetType="COLLABORATION_POST" targetId={detail.postId} />
            <DetailBookmarkButton postId={detail.postId} initialBookmarked={detail.bookmarked} />
          </div>
        </div>

        {detail.postIndustries.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {detail.postIndustries.map((name) => (
              <Badge key={name} variant="secondary" size="md">
                {name}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-ink-600 mt-3.5 text-sm leading-relaxed whitespace-pre-line">
          {detail.description}
        </p>

        <div className="mt-4 space-y-2.5">
          {budget && <MetaRow icon={<LuCoins className="h-4 w-4" />} label="예산" value={budget} />}
          {period && (
            <MetaRow icon={<LuCalendar className="h-4 w-4" />} label="기간" value={period} />
          )}
          {detail.region && (
            <MetaRow icon={<LuMapPin className="h-4 w-4" />} label="지역" value={detail.region} />
          )}
          {detail.collaborationMethod && (
            <MetaRow
              icon={<LuHandshake className="h-4 w-4" />}
              label="협업 방식"
              value={detail.collaborationMethod}
            />
          )}
          {detail.applicationDeadline && (
            <MetaRow
              icon={<LuCalendar className="h-4 w-4" />}
              label="신청 마감"
              value={`${formatKst(detail.applicationDeadline, 'yyyy.MM.dd')}${
                isDeadlinePassed(detail.applicationDeadline) ? ' (마감됨)' : ''
              }`}
            />
          )}
        </div>

        {detail.requiredPartnerSkills.length > 0 && (
          <div className="mt-4">
            <p className="text-ink-700 text-[13px] font-semibold">필요 역량</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {detail.requiredPartnerSkills.map((name) => (
                <span
                  key={name}
                  className="bg-brand-soft text-brand-sub02 rounded-full px-2.5 py-1 text-[12px] font-medium"
                >
                  #{name}
                </span>
              ))}
            </div>
          </div>
        )}

        {detail.attachments.length > 0 && <AttachmentList attachments={detail.attachments} />}

        <div className="border-ink-100 text-ink-400 mt-4 flex items-center gap-4 border-t pt-3.5 text-[13px]">
          <span className="flex items-center gap-1">
            <LuUsers className="h-4 w-4" />
            조회 {detail.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <LuMessageCircle className="h-4 w-4" />
            제안 {detail.proposalCount}
          </span>
          <span className="flex items-center gap-1">
            <LuBookmark className="h-4 w-4" />
            저장 {detail.bookmarkCount}
          </span>
          <span className="ml-auto">{formatKst(detail.createdAt, 'yyyy.MM.dd')}</span>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-ink-400 text-[12px] font-semibold">공고 기업</p>
        <div className="mt-2.5 flex items-center gap-2.5">
          <Avatar fallback={[...detail.companyName][0] ?? '?'} />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-ink-900 truncate text-[17px] font-bold">{detail.companyName}</h3>
              {detail.verified && <LuBadgeCheck className="text-brand h-4 w-4 shrink-0" />}
            </div>
            {detail.industryName && <p className="text-ink-500 text-[13px]">{detail.industryName}</p>}
          </div>
        </div>

        {companyStats.length > 0 && (
          <p className="text-ink-400 mt-2.5 text-[12px]">{companyStats.join(' · ')}</p>
        )}

        {detail.companyDescription && (
          <p className="text-ink-600 mt-3.5 text-[13px] leading-relaxed">
            {detail.companyDescription}
          </p>
        )}

        {detail.trackRecord && (
          <div className="mt-3.5">
            <p className="text-ink-700 text-[13px] font-semibold">주요 수행 이력</p>
            <p className="text-ink-600 mt-1 text-[13px] leading-relaxed whitespace-pre-line">
              {detail.trackRecord}
            </p>
          </div>
        )}

        <div className="text-ink-500 mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
          {detail.revenueInCheonwon != null && (
            <span className="flex items-center gap-1">
              <LuTrendingUp className="text-brand h-4 w-4" />
              {formatRevenue(detail.revenueInCheonwon)}
            </span>
          )}
          {detail.website && (
            <a
              href={detail.website}
              target="_blank"
              rel="noreferrer"
              className="text-brand flex items-center gap-1"
            >
              <LuGlobe className="h-4 w-4" />
              홈페이지
            </a>
          )}
        </div>

        {detail.capabilityTags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {detail.capabilityTags.map((t) => (
              <span
                key={t}
                className="bg-ink-100 text-ink-600 rounded-full px-2.5 py-1 text-[12px] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="text-ink-900 text-base font-bold">협업 제안하기</h3>
        {detail.isOwnPost ? (
          <p className="text-ink-500 mt-2 text-[13px]">내가 올린 공고입니다.</p>
        ) : isDeadlinePassed(detail.applicationDeadline) ? (
          <p className="text-ink-500 mt-2 text-[13px]">
            마감된 공고입니다. 새 제안을 받을 수 없어요.
          </p>
        ) : (
          <div className="mt-3.5">
            <ProposalForm postId={detail.postId} />
          </div>
        )}
      </Card>
    </div>
  );
};

const MetaRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2 text-[13px]">
    <span className="text-ink-400">{icon}</span>
    <span className="text-ink-400 w-16 shrink-0">{label}</span>
    <span className="text-ink-700 font-medium">{value}</span>
  </div>
);

// 표현 변환 = ui. 천원 단위 예산/매출을 억·만원 문자열로.
function formatCheonwon(cheonwon: number): string {
  const won = cheonwon * 1000;
  if (won >= 1e8) {
    const eok = won / 1e8;
    return `${Number.isInteger(eok) ? eok : eok.toFixed(1)}억`;
  }
  return `${Math.round(won / 1e4).toLocaleString()}만`;
}

function formatBudget(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${formatCheonwon(min)} ~ ${formatCheonwon(max)}`;
  if (min != null) return `${formatCheonwon(min)} 이상`;
  return `${formatCheonwon(max as number)} 이하`;
}

function formatRevenue(cheonwon: number): string {
  return `연매출 ${formatCheonwon(cheonwon)}`;
}

// 설립일 → "업력 N년차"(설립 첫해가 1년차). 공개 안 됐으면 null. (표현 변환 = ui)
function formatYearsInBusiness(foundedDate: Date | null): string | null {
  if (!foundedDate) return null;
  return `업력 ${differenceInCalendarYears(new Date(), foundedDate) + 1}년차`;
}

function formatPeriod(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null;
  const s = start ? formatKst(start, 'yyyy.MM.dd') : '';
  const e = end ? formatKst(end, 'yyyy.MM.dd') : '';
  if (start && end) return `${s} ~ ${e}`;
  return start ? `${s} ~` : `~ ${e}`;
}
