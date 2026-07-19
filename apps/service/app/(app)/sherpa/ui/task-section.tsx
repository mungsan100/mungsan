import { getSherpaTasksQuery } from '../queries/sherpa-tasks.query';
import { CreateProjectForm } from './create-project-form';
import { StarterTasksBanner } from './starter-tasks-banner';
import { TaskList } from './task-list';

// 할 일 섹션 서버 로더 — primary 프로젝트의 할 일과 마일스톤 옵션을 조회해 client 리스트에 넘긴다.
// 프로젝트가 없으면 안내 + 수동 생성 폼을 보여준다(협업 수락 없이도 할 일 기능을 쓸 수 있는 경로).
// 할 일이 하나도 없는 프로젝트(협업 수락 직후 등)에는 시작 할일 추천 배너를 함께 보여준다(결정 7 A안).
export async function TaskSection() {
  const view = await getSherpaTasksQuery();

  if (!view)
    return (
      <div className="space-y-3">
        <p className="text-ink-400 pt-1 text-center text-sm">
          아직 진행 중인 프로젝트가 없습니다.
          <br />
          협업 제안을 수락하면 자동으로 생기고, 직접 만들 수도 있어요.
        </p>
        <CreateProjectForm />
      </div>
    );

  return (
    <div className="space-y-3">
      {view.tasks.length === 0 && <StarterTasksBanner projectId={view.projectId} />}
      <TaskList
        projectId={view.projectId}
        tasks={view.tasks}
        milestoneOptions={view.milestoneOptions}
      />
    </div>
  );
}
