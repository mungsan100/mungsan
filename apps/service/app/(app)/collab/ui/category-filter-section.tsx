import { getCollabIndustriesQuery } from '../queries/collab-industries.query';
import { CollabCategoryFilter } from './collab-category-filter';

// RSC→client 경계 — Industry 카탈로그를 조회해 클라이언트 탭에 넘긴다.
export const CategoryFilterSection = async () => {
  const industries = await getCollabIndustriesQuery();
  return <CollabCategoryFilter industries={industries} />;
};
