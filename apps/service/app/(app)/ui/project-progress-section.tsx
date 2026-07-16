import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getHomeProjectsQuery, type HomeProject } from '../queries/home-projects.query';
import { ProjectProgressCard, type ProjectProgress } from './project-progress-card';

// 진행 중인 협업 섹션 — 내 프로젝트를 조회해 진행 카드로 렌더.
export async function ProjectProgressSection() {
  const user = await getCurrentUser();
  const projects = await getHomeProjectsQuery(user.id);

  if (projects.length === 0)
    return <p className="text-ink-400 text-sm">진행 중인 협업이 없습니다.</p>;

  const now = new Date();
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <ProjectProgressCard key={project.id} project={toCard(project, now)} />
      ))}
    </div>
  );
}

// DB Project → 카드 표시 모델. Project엔 상태 필드가 없어 마감일·진행률로 지연 여부를 파생한다.
function toCard(p: HomeProject, now: Date): ProjectProgress {
  const overdue = p.endDate != null && p.endDate < now && p.progressPercentage < 100;
  return {
    title: p.title,
    subtitle: p.description ?? '진행 중',
    statusLabel: overdue ? '일정 지연' : '일정 정상',
    tone: overdue ? 'danger' : 'success',
    percent: p.progressPercentage,
  };
}
