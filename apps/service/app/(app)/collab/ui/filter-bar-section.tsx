import { getCollabRegionsQuery } from '../queries/collab-marketplace.query';
import { getCollabSkillsQuery } from '../queries/collab-skills.query';
import { CollabFilterBar } from './collab-filter-bar';

// 상세 필터 옵션(역량 카탈로그·실데이터 지역) 로더 — client 필터 바에 내려준다.
export async function FilterBarSection() {
  const [skills, regions] = await Promise.all([getCollabSkillsQuery(), getCollabRegionsQuery()]);
  return <CollabFilterBar skills={skills} regions={regions} />;
}
