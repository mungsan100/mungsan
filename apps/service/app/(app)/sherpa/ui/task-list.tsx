'use client';

import { useState, useTransition } from 'react';
import {
  LuCheck,
  LuChevronDown,
  LuChevronUp,
  LuLoaderCircle,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import { toast } from 'sonner';
import type { DB } from '@mungsan/db';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatKst } from '@/lib/datetime/format-kst';
import { cn } from '@/lib/utils';

import { createTaskAction } from '../commands/create-task.action';
import { deleteTaskAction } from '../commands/delete-task.action';
import { toggleTaskCompleteAction } from '../commands/toggle-task-complete.action';
import { updateTaskAction } from '../commands/update-task.action';
import type { SherpaTaskView } from '../queries/sherpa-tasks.query';

// 할 일 상태 → 표시 라벨/배지 톤 (소비 컴포넌트 로컬 사전).
const STATUS_META: Record<DB.TaskStatus, { label: string; variant: 'secondary' | 'success' | 'danger' | 'default' }> = {
  PLANNED: { label: '예정', variant: 'secondary' },
  IN_PROGRESS: { label: '진행 중', variant: 'success' },
  COMPLETED: { label: '완료', variant: 'default' },
  ON_HOLD: { label: '보류', variant: 'danger' },
};

const STATUS_OPTIONS: { value: DB.TaskStatus; label: string }[] = [
  { value: 'PLANNED', label: '예정' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'ON_HOLD', label: '보류' },
];

interface TaskListProps {
  projectId: string;
  tasks: SherpaTaskView[];
  milestoneOptions: { id: string; title: string }[];
}

export const TaskList = ({ projectId, tasks, milestoneOptions }: TaskListProps) => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-ink-400 py-4 text-center text-sm">
          아직 할 일이 없습니다. 첫 업무를 등록해 보세요.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskItem task={task} />
            </li>
          ))}
        </ul>
      )}

      {formOpen ? (
        <CreateTaskForm
          projectId={projectId}
          milestoneOptions={milestoneOptions}
          onDone={() => setFormOpen(false)}
        />
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setFormOpen(true)}>
          <LuPlus className="h-4 w-4" />할 일 추가
        </Button>
      )}
    </div>
  );
};

const TaskItem = ({ task }: { task: SherpaTaskView }) => {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const completed = task.status === 'COMPLETED';
  const status = STATUS_META[task.status];

  function toggleComplete() {
    startTransition(async () => {
      const result = await toggleTaskCompleteAction({ taskId: task.id });
      if (!result.ok) toast.error(result.message);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteTaskAction({ taskId: task.id });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="shadow-card rounded-2xl bg-white p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggleComplete}
          disabled={isPending}
          aria-label={completed ? '완료 취소' : '완료 처리'}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors disabled:opacity-60',
            completed ? 'border-brand bg-brand text-white' : 'border-ink-200 bg-white',
          )}
        >
          {completed && <LuCheck className="h-3.5 w-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'text-[15px] font-bold',
                completed ? 'text-ink-400 line-through' : 'text-ink-900',
              )}
            >
              {task.title}
            </span>
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          </div>
          <p className="text-ink-400 mt-1 text-[12px]">
            {task.milestoneTitle}
            {task.dueDate && ` · 마감 ${formatKst(task.dueDate, 'yyyy.MM.dd')}`}
          </p>
          {task.description && (
            <p className="text-ink-500 mt-1 line-clamp-2 text-[13px]">{task.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditOpen((v) => !v)}
            aria-label="수정"
            className="text-ink-400 flex h-8 w-8 items-center justify-center"
          >
            {editOpen ? <LuChevronUp className="h-4 w-4" /> : <LuChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            aria-label="삭제"
            className="text-ink-400 flex h-8 w-8 items-center justify-center disabled:opacity-60"
          >
            {isPending ? (
              <LuLoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LuTrash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {editOpen && <EditTaskForm task={task} onDone={() => setEditOpen(false)} />}
    </div>
  );
};

const EditTaskForm = ({ task, onDone }: { task: SherpaTaskView; onDone: () => void }) => {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState<DB.TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ? formatKst(task.dueDate, 'yyyy-MM-dd') : '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateTaskAction({
        taskId: task.id,
        title,
        description: description.trim() || null,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      if (result.ok) {
        toast.success(result.message);
        onDone();
      } else toast.error(result.message);
    });
  }

  return (
    <form onSubmit={submit} className="border-ink-100 mt-3 space-y-3 border-t pt-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="업무 제목" />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="업무 설명 (선택)"
        className="min-h-20"
      />
      <div className="flex gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value as DB.TaskStatus)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onDone}>
          취소
        </Button>
        <Button type="submit" variant="brand" className="flex-1" disabled={isPending}>
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          저장
        </Button>
      </div>
    </form>
  );
};

const CreateTaskForm = ({
  projectId,
  milestoneOptions,
  onDone,
}: {
  projectId: string;
  milestoneOptions: { id: string; title: string }[];
  onDone: () => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<DB.TaskStatus>('PLANNED');
  const [dueDate, setDueDate] = useState('');
  const [milestoneId, setMilestoneId] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('업무 제목을 입력해 주세요.');
      return;
    }
    startTransition(async () => {
      const result = await createTaskAction({
        projectId,
        milestoneId: milestoneId || null,
        title,
        description: description.trim() || null,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      if (result.ok) {
        toast.success(result.message);
        onDone();
      } else toast.error(result.message);
    });
  }

  return (
    <form onSubmit={submit} className="shadow-card space-y-3 rounded-2xl bg-white p-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-task-title">업무 제목</Label>
        <Input
          id="new-task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 파트너사 계약서 검토"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-task-desc">업무 설명 (선택)</Label>
        <Textarea
          id="new-task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상세 내용을 적어주세요."
          className="min-h-20"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-task-status">상태</Label>
          <Select
            id="new-task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as DB.TaskStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-task-due">마감일 (선택)</Label>
          <Input
            id="new-task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      {milestoneOptions.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="new-task-milestone">마일스톤 (선택)</Label>
          <Select
            id="new-task-milestone"
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
          >
            <option value="">자동 (일반)</option>
            {milestoneOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onDone}>
          취소
        </Button>
        <Button type="submit" variant="brand" className="flex-1" disabled={isPending}>
          {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
          등록
        </Button>
      </div>
    </form>
  );
};
