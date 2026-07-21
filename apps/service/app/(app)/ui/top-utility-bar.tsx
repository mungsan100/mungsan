'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { LuMenu, LuMegaphone, LuCircleHelp, LuHeadset, LuSettings } from 'react-icons/lu';
import type { IconType } from 'react-icons';

// 모든 탭 우측 상단 공통 유틸(2026-07-21 IA 2차) — 🔔 알림(서버 렌더 bell 슬롯) + ☰ 더보기.
// 중앙 정렬 모바일 프레임(max 480) 상단 우측에 고정. 헤더 제목은 좌측이라 겹치지 않는다.
// 레이아웃 직속 클라이언트 컴포넌트로 둬야 하이드레이션된다(async 서버 래퍼로 감싸면 ☰가 죽는다) —
// 그래서 미읽음 수가 담긴 벨은 서버에서 렌더해 children(bell)로 주입받는다(홈 헤더 bell 슬롯과 동일 사상).
// 더보기는 ☰ 버튼 바로 아래에 열리는 드롭다운(2026-07-22) — 화면 하단 시트는 누른 위치와 멀어
// "페이지가 내려간" 것처럼 보인다는 피드백으로 교체.
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
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
          className="text-ink-700 pointer-events-auto inline-flex h-10 w-10 items-center justify-center"
        >
          <LuMenu className="h-[22px] w-[22px]" />
        </button>
      </div>

      {moreOpen && (
        <>
          {/* 살짝 어두운 백드롭 — 바깥을 누르면 닫힌다. */}
          <button
            type="button"
            aria-label="더보기 닫기"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-[55] bg-black/20"
          />
          {/* ☰ 바로 아래 우측 정렬 드롭다운 — 프레임(max 480) 기준으로 앵커. */}
          <div className="pointer-events-none fixed top-0 left-1/2 z-[60] w-full max-w-[480px] -translate-x-1/2 px-3 pt-14">
            <div className="animate-fadein shadow-pop pointer-events-auto ml-auto w-44 rounded-2xl bg-white p-1.5">
              {MORE_ITEMS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="hover:bg-ink-100 flex items-center gap-3 rounded-xl px-3 py-2.5"
                >
                  <span className="bg-brand-soft text-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-ink-800 text-[14px] font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
