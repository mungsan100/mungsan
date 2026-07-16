import { getSherpaTasksQuery } from '../queries/sherpa-tasks.query';
import { TaskList } from './task-list';

// 할 일 섹션 서버 로더 — primary 프로젝트의 할 일과 마일스톤 옵션을 조회해 client 리스트에 넘긴다.
export async function TaskSection() {
  const view = await getSherpaTasksQuery();

  if (!view)
    return (
      <p className="text-ink-400 py-6 text-center text-sm">
        진행 중인 프로젝트가 없습니다. 협업이 시작되면 할 일을 관리할 수 있어요.
      </p>
    );

  return (
    <TaskList projectId={view.projectId} tasks={view.tasks} milestoneOptions={view.milestoneOptions} />
  );
}
