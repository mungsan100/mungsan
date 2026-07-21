import Link from 'next/link';
import { LuInbox, LuSend, LuPencilLine, LuBookmark } from 'react-icons/lu';
import type { IconType } from 'react-icons';

// 내 정보 허브의 바로가기 4개(2026-07-21 IA 1차) — 각 항목은 별도 페이지로 분리됐다.
const ITEMS: { href: string; label: string; Icon: IconType }[] = [
  { href: '/manage/received-proposals', label: '받은 제안', Icon: LuInbox },
  { href: '/manage/sent-proposals', label: '보낸 제안', Icon: LuSend },
  { href: '/manage/my-posts', label: '내가 쓴 글', Icon: LuPencilLine },
  { href: '/manage/saved', label: '저장한 글', Icon: LuBookmark },
];

export function MypageMenuGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ITEMS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className="shadow-card flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4"
        >
          <span className="bg-brand-soft text-brand flex h-11 w-11 items-center justify-center rounded-full">
            <Icon className="h-[22px] w-[22px]" />
          </span>
          <span className="text-ink-700 text-[12px] font-semibold">{label}</span>
        </Link>
      ))}
    </div>
  );
}
