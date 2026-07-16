import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';

// 글쓰기 FAB — 모바일 프레임(480px) 우하단, 탭바 위에 뜨는 그린 pill.
export const WriteFab = () => (
  <div className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2">
    <Link
      href="/lounge/write"
      className="bg-brand shadow-raised pointer-events-auto absolute right-5 bottom-20 inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-semibold text-white"
    >
      <LuPencil className="h-5 w-5" />
      글쓰기
    </Link>
  </div>
);
