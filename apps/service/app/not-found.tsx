import Link from 'next/link';
import { LuCompass } from 'react-icons/lu';

// 커스텀 404 — Next 기본 영문 화면 대체(오픈 전 기본기). 정적 콘텐츠라 프리렌더된다.
export default function NotFound() {
  return (
    <div className="bg-canvas flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <div className="bg-brand-soft mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
          <LuCompass className="text-brand h-8 w-8" />
        </div>
        <h1 className="text-ink-900 mt-6 text-xl font-bold">페이지를 찾을 수 없어요</h1>
        <p className="text-ink-500 mt-2 text-sm leading-relaxed">
          주소가 잘못됐거나 삭제된 페이지예요.
          <br />
          아래 버튼으로 홈으로 돌아가실 수 있어요.
        </p>
        <Link
          href="/"
          className="bg-brand hover:bg-brand-sub01 mt-8 inline-block w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
