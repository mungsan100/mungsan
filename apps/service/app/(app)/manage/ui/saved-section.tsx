import Link from 'next/link';
import { LuBookmark } from 'react-icons/lu';
import type { DB } from '@mungsan/db';

import { SectionHeader } from '@/components/section-header';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { isDeadlinePassed } from '@/lib/collab/deadline';
import { formatRelativeKorean } from '@/lib/datetime/relative-time';

import { getSavedItemsQuery } from '../queries/saved-items.query';
import { UnsaveButton } from './unsave-button';

// 라운지 카테고리 → 표시 라벨 — 표시 어휘는 소비처(ui) 로컬 사전(lounge/ui/lounge-category와 동일 값).
const LOUNGE_CATEGORY_LABELS: Record<DB.LoungeCategory, string> = {
  COLLABORATION: '협업 제안',
  BUSINESS_CONCERN: '사업 고민',
  INVESTMENT_FUNDING: '투자·자금',
  DEVELOPMENT_TECH: '개발·기술',
  MARKETING_SALES: '마케팅·영업',
  GOVERNMENT_SUPPORT: '정부지원',
  ETC: '기타',
};

// 저장한 글 모아보기(#7 결정) — 저장 버튼의 짝이 되는 목록 화면. 라운지/협업을
// 구분해 보여주고, 행 클릭 시 원문으로 이동하며 여기서 저장 취소도 가능하다.
export async function SavedSection() {
  const user = await getCurrentUser();
  const saved = await getSavedItemsQuery(user.id);
  const isEmpty = saved.lounge.length === 0 && saved.collab.length === 0;

  return (
    <section className="px-5">
      <SectionHeader icon={<LuBookmark className="h-[18px] w-[18px]" />} title="저장한 글" />
      <div className="mt-3 space-y-4">
        {isEmpty ? (
          <p className="text-ink-400 py-8 text-center text-sm">
            저장한 글이 없습니다. 라운지·협업 마켓에서 저장한 글이 여기에 모입니다.
          </p>
        ) : (
          <>
            {saved.lounge.length > 0 && (
              <div className="space-y-2">
                <p className="text-ink-500 text-xs font-semibold">라운지 · {saved.lounge.length}</p>
                {saved.lounge.map((item) => (
                  <div
                    key={item.postId}
                    className="shadow-card flex items-center gap-1 rounded-2xl bg-white p-4"
                  >
                    <Link href={`/lounge/${item.postId}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{LOUNGE_CATEGORY_LABELS[item.category]}</Badge>
                      </div>
                      <p className="text-ink-900 mt-1.5 truncate text-[15px] font-bold">
                        {item.title}
                      </p>
                      <p className="text-ink-400 mt-1 text-[12px]">
                        좋아요 {item.likeCount} · 댓글 {item.commentCount} ·{' '}
                        {formatRelativeKorean(item.savedAt)} 저장
                      </p>
                    </Link>
                    <UnsaveButton target="LOUNGE" postId={item.postId} />
                  </div>
                ))}
              </div>
            )}

            {saved.collab.length > 0 && (
              <div className="space-y-2">
                <p className="text-ink-500 text-xs font-semibold">
                  협업 공고 · {saved.collab.length}
                </p>
                {saved.collab.map((item) => (
                  <div
                    key={item.postId}
                    className="shadow-card flex items-center gap-1 rounded-2xl bg-white p-4"
                  >
                    <Link href={`/collab/${item.postId}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-ink-500 truncate text-xs font-semibold">
                          {item.companyName}
                        </p>
                        {isDeadlinePassed(item.applicationDeadline) && (
                          <Badge variant="default">마감</Badge>
                        )}
                      </div>
                      <p className="text-ink-900 mt-1.5 truncate text-[15px] font-bold">
                        {item.title}
                      </p>
                      <p className="text-ink-400 mt-1 text-[12px]">
                        {formatRelativeKorean(item.savedAt)} 저장
                      </p>
                    </Link>
                    <UnsaveButton target="COLLAB" postId={item.postId} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
