import { Suspense } from 'react';
import { LuLayers } from 'react-icons/lu';

import { getSherpaProjectQuery } from '../queries/sherpa-project.query';

// My 셰르파 밝은 헤더 — canvas 배경 + ink 텍스트. 서브텍스트(프로젝트 제목)는 국소 Suspense로 스트리밍.
export const SherpaHeader = () => (
  <header className="bg-canvas px-5 pt-12 pb-5">
    <div className="flex items-center gap-2">
      <LuLayers className="text-ink-900 h-7 w-7" />
      <h1 className="text-ink-900 text-2xl font-bold">My 셰르파</h1>
    </div>
    <Suspense
      fallback={<span className="bg-ink-100 mt-1.5 block h-4 w-40 animate-pulse rounded" />}
    >
      <ProjectName />
    </Suspense>
  </header>
);

const ProjectName = async () => {
  const project = await getSherpaProjectQuery();
  return <p className="text-ink-500 mt-1 text-sm">{project?.title ?? '진행 중인 프로젝트'}</p>;
};
