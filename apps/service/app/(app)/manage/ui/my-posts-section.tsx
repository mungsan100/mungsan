import Link from 'next/link';
import { LuChevronRight, LuPencilLine } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { SectionHeader } from '@/components/section-header';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { isDeadlinePassed } from '@/lib/collab/deadline';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { getMyPostsQuery } from '../queries/my-posts.query';

// 라운지 카테고리 → 표시 라벨(saved-section과 동일 사전).
const LOUNGE_CATEGORY_LABELS: Record<DB.LoungeCategory, string> = {
  COLLABORATION: '협업 제안',
  BUSINESS_CONCERN: '사업 고민',
  INVESTMENT_FUNDING: '투자·자금',
  DEVELOPMENT_TECH: '개발·기술',
  MARKETING_SALES: '마케팅·영업',
  GOVERNMENT_SUPPORT: '정부지원',
  HIRING_HR: '채용·인사',
  ORG_CULTURE: '조직문화',
  OUTSOURCING: '외주·아웃소싱',
  BURNOUT_MENTAL: '번아웃·멘탈',
  ETC: '기타',
};

// 내가 쓴 글 모아보기(2026-07-21) — 본인이 작성한 라운지 글 + 협업 공고를 구분해 보여준다.
// 행을 누르면 원문 상세로 이동하며, 상세 화면에서 본인 삭제(작성자 전용 삭제 버튼)로 이어진다.
export async function MyPostsSection() {
  const user = await getCurrentUser();
  const posts = await getMyPostsQuery(user.id);
  const isEmpty = posts.lounge.length === 0 && posts.collab.length === 0;

  return (
    <section className="px-5">
      <SectionHeader icon={<LuPencilLine className="h-[18px] w-[18px]" />} title="내가 쓴 글" />
      <div className="mt-3 space-y-4">
        {isEmpty ? (
          <p className="text-ink-400 py-8 text-center text-sm">
            작성한 글이 없습니다. 라운지·협업 마켓에 올린 글이 여기에 모입니다.
          </p>
        ) : (
          <>
            {posts.lounge.length > 0 && (
              <div className="space-y-2">
                <p className="text-ink-500 text-xs font-semibold">라운지 · {posts.lounge.length}</p>
                {posts.lounge.map((item) => (
                  <Link
                    key={item.postId}
                    href={`/lounge/${item.postId}`}
                    className="shadow-card flex items-center gap-1 rounded-2xl bg-white p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{LOUNGE_CATEGORY_LABELS[item.category]}</Badge>
                        {item.hidden && <Badge variant="default">숨김</Badge>}
                      </div>
                      <p className="text-ink-900 mt-1.5 truncate text-[15px] font-bold">
                        {item.title}
                      </p>
                      <p className="text-ink-400 mt-1 text-[12px]">
                        좋아요 {item.likeCount} · 댓글 {item.commentCount} ·{' '}
                        {formatRelativeKorean(item.createdAt)} 작성
                      </p>
                    </div>
                    <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            {posts.collab.length > 0 && (
              <div className="space-y-2">
                <p className="text-ink-500 text-xs font-semibold">협업 공고 · {posts.collab.length}</p>
                {posts.collab.map((item) => (
                  <Link
                    key={item.postId}
                    href={`/collab/${item.postId}`}
                    className="shadow-card flex items-center gap-1 rounded-2xl bg-white p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isDeadlinePassed(item.applicationDeadline) && <Badge variant="default">마감</Badge>}
                        {item.hidden && <Badge variant="default">숨김</Badge>}
                      </div>
                      <p className="text-ink-900 truncate text-[15px] font-bold">{item.title}</p>
                      <p className="text-ink-400 mt-1 text-[12px]">
                        {formatRelativeKorean(item.createdAt)} 작성
                      </p>
                    </div>
                    <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            <p className="text-ink-400 text-center text-[12px]">
              글을 누르면 상세로 이동합니다. 삭제는 각 글 상세 화면에서 할 수 있어요.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
