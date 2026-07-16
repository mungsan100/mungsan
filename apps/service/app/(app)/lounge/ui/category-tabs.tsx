import { getLoungeIndustriesQuery } from '../queries/lounge-industries.query';
import { CategoryFilter } from './category-filter';

// 산업 카탈로그를 조회해 client 필터 칩에 넘기는 서버 로더.
export async function CategoryTabs() {
  const industries = await getLoungeIndustriesQuery();
  return <CategoryFilter industries={industries} />;
}
