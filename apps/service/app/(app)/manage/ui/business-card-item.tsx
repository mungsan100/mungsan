'use client';

import { useState, useTransition } from 'react';
import { LuTrash2, LuLoaderCircle } from 'react-icons/lu';
import { toast } from 'sonner';

import { deleteBusinessCardAction } from '../cards/commands/delete-business-card.action';
import type { MyCard } from '../queries/my-cards.query';

// 명함첩 한 장 — 이미지 썸네일 + 5필드 + 삭제(확인 후). 삭제는 소유자 본인만(서버가 재확인).
export function BusinessCardItem({ card }: { card: MyCard }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await deleteBusinessCardAction(card.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setConfirming(false);
    });
  }

  const lines = [card.company, card.jobTitle].filter(Boolean).join(' · ');

  return (
    <div className="shadow-card flex gap-3 rounded-2xl bg-white p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- 서명 URL(만료) 이미지, 원격 최적화 대상 아님 */}
      <img
        src={card.imageUrl}
        alt={card.name ? `${card.name} 명함` : '명함'}
        className="border-ink-100 h-16 w-24 shrink-0 rounded-lg border object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-ink-900 truncate text-[15px] font-bold">{card.name || '(이름 미확인)'}</p>
        {lines && <p className="text-ink-500 mt-0.5 truncate text-[13px]">{lines}</p>}
        <p className="text-ink-400 mt-0.5 truncate text-[12px]">
          {[card.phone, card.email].filter(Boolean).join(' · ') || '연락처 미확인'}
        </p>
      </div>

      {confirming ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="text-danger inline-flex items-center gap-1 text-xs font-bold"
          >
            {isPending && <LuLoaderCircle className="h-3 w-3 animate-spin" />} 삭제 확인
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="text-ink-400 text-xs"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label="명함 삭제"
          className="text-ink-300 hover:text-danger h-fit shrink-0 p-1"
        >
          <LuTrash2 className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
}
