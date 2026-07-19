'use client';

import { useState, useTransition } from 'react';
import { LuLoaderCircle, LuSparkles, LuX } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { createTaskAction } from '../commands/create-task.action';

// 협업 시작 시 흔한 첫 할일 3종 — 강제하지 않는 추천(2026-07-20 결정 7, A안).
const STARTER_TEMPLATES = [
  '첫 미팅 일정 잡기',
  '계약 조건 정리',
  '킥오프 자료 준비',
] as const;

// 시작 할일 추천 배너 — 할 일이 없는 프로젝트에서만 보인다(부모가 조건 렌더).
// 원하는 템플릿만 골라 한 번에 추가한다. 추가하면 할 일이 생겨 배너는 자연히 사라지고,
// 닫기는 이 화면에 머무는 동안만 기억한다(상태 저장 없음 — 새로 방문하면 다시 제안).
export const StarterTasksBanner = ({ projectId }: { projectId: string }) => {
  const [dismissed, setDismissed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(STARTER_TEMPLATES));
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  function toggle(title: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  function addSelected() {
    const titles = STARTER_TEMPLATES.filter((title) => selected.has(title));
    if (titles.length === 0) {
      toast.error('추가할 할 일을 선택해 주세요.');
      return;
    }
    startTransition(async () => {
      const results = await Promise.all(
        titles.map((title) =>
          createTaskAction({
            projectId,
            milestoneId: null,
            title,
            description: null,
            status: 'PLANNED',
            dueDate: null,
          }),
        ),
      );
      const failed = results.filter((result) => !result.ok).length;
      if (failed > 0) toast.error(`${failed}건은 추가하지 못했습니다. 다시 시도해 주세요.`);
      else toast.success(`할 일 ${titles.length}개를 추가했습니다.`);
    });
  }

  return (
    <div className="bg-brand-soft space-y-3 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <LuSparkles className="text-brand h-4 w-4 shrink-0" />
          <p className="text-ink-900 text-sm font-bold">협업을 시작할 때 흔한 할 일이에요</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="추천 닫기"
          className="text-ink-400 hover:text-ink-600 shrink-0 rounded-full p-1"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STARTER_TEMPLATES.map((title) => {
          const on = selected.has(title);
          return (
            <button
              key={title}
              type="button"
              onClick={() => toggle(title)}
              aria-pressed={on}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors',
                on
                  ? 'border-brand bg-brand text-white'
                  : 'border-ink-200 text-ink-500 bg-white',
              )}
            >
              {title}
            </button>
          );
        })}
      </div>

      <Button variant="brand" className="w-full" onClick={addSelected} disabled={isPending}>
        {isPending && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
        선택한 할 일 추가
      </Button>
    </div>
  );
};
