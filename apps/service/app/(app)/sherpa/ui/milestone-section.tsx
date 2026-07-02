import { getSherpaMilestonesQuery } from '../queries/sherpa-milestones.query';
import { getSherpaProjectQuery } from '../queries/sherpa-project.query';
import { MilestoneTimeline } from './milestone-timeline';

// 마일스톤 데이터를 fetch해 client 타임라인에 넘기는 RSC 경계. 전체 진행률은 프로젝트 스냅샷.
export const MilestoneSection = async () => {
  const [milestones, project] = await Promise.all([
    getSherpaMilestonesQuery(),
    getSherpaProjectQuery(),
  ]);

  return <MilestoneTimeline milestones={milestones} progress={project?.progressPercentage ?? 0} />;
};
