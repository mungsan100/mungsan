import type { DB } from '@mungsan/db';

// 게시글의 주제 분류(LoungeCategory) → 표시 라벨. 카드/상세의 카테고리 태그와
// LoungeCategoryFilter가 함께 쓰는 표시 어휘라 소비처(ui) 로컬에 둔다.
export const LOUNGE_CATEGORY_LABELS: Record<DB.LoungeCategory, string> = {
  COLLABORATION: '협업 제안',
  BUSINESS_CONCERN: '사업 고민',
  INVESTMENT_FUNDING: '투자·자금',
  DEVELOPMENT_TECH: '개발·기술',
  MARKETING_SALES: '마케팅·영업',
  GOVERNMENT_SUPPORT: '정부지원',
  ETC: '기타',
};
