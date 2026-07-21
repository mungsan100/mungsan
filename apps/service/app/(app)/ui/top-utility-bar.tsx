'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { LuMenu, LuMegaphone, LuCircleHelp, LuHeadset, LuSettings, LuX } from 'react-icons/lu';
import type { IconType } from 'react-icons';

// 모든 탭 우측 상단 공통 유틸(2026-07-21 IA 2차) — 🔔 알림(서버 렌더 bell 슬롯) + ☰ 더보기.
// 중앙 정렬 모바일 프레임(max 480) 상단 우측에 고정. 헤더 제목은 좌측이라 겹치지 않는다.
// 레이아웃 직속 클라이언트 컴포넌트로 둬야 하이드레이션된다(async 서버 래퍼로 감싸면 ☰가 죽는다) —
// 그래서 미읽음 수가 담긴 벨은 서버에서 렌더해 children(bell)로 주입받는다(홈 헤더 bell 슬롯과 동일 사상).
const MORE_ITEMS: { href: string; label: string; Icon: IconType }[] = [
  { href: '/notices', label: '공지사항', Icon: LuMegaphone },
  { href: '/help', label: '도움말', Icon: LuCircleHelp },
  { href: '/manage/inquiry', label: '1:1 문의', Icon: LuHeadset },
  { href: '/manage/settings', label: '설정', Icon: LuSettings },
];

export function TopUtilityBar({ bell }: { bell: ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed top-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 justify-end gap-1 px-3 pt-3">
        <div className="pointer-events-auto">{bell}</div>
        <button
          type="button"
          aria-label="더보기"
          onClick={() => setMoreOpen(true)}
          className="text-ink-700 pointer-events-auto inline-flex h-10 w-10 items-center justify-center"
        >
          <LuMenu className="h-[22px] w-[22px]" />
        </button>
      </div>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="animate-fadein relative w-full max-w-[480px] rounded-t-3xl bg-white px-5 pt-4 pb-8">
            <div className="flex items-center justify-between">
              <p className="text-ink-900 text-base font-bold">더보기</p>
              <button type="button" aria-label="닫기" onClick={() => setMoreOpen(false)} className="text-ink-400 p-1">
                <LuX className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {MORE_ITEMS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl py-3"
                >
                  <span className="bg-brand-soft text-brand flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-ink-700 text-[12px] font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
