import { getCollabPostCountQuery } from '../queries/collab-marketplace.query';

// 헤더 하단 실 count — 공개 협업 공고(기업) 수.
export const CollabCount = async () => {
  const count = await getCollabPostCountQuery();
  return <p className="text-brand mt-1 text-[13px] font-semibold">{count.toLocaleString()}개 기업</p>;
};
