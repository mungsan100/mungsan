import type { ReactNode } from 'react';
import { LuSparkles } from 'react-icons/lu';

// 홈 밝은 헤더 셸 — 정적. 인사(이름)와 알림 벨은 동적이라 슬롯으로 받아 각자 스트리밍한다.
interface HomeHeaderProps {
  greeting: ReactNode;
  bell: ReactNode;
}

export const HomeHeader = ({ greeting, bell }: HomeHeaderProps) => (
  <header className="bg-canvas px-5 pt-12 pb-6">
    <div className="flex items-start justify-between">
      <span className="bg-ink-100 text-ink-600 flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold">
        <LuSparkles className="text-brand h-3.5 w-3.5" />
        뭉산 브리핑
      </span>
      {bell}
    </div>
    <div className="mt-4">
      {greeting}
      <h1 className="text-ink-900 mt-1 text-[26px] leading-tight font-bold">
        오늘의 협업 전략입니다
      </h1>
    </div>
  </header>
);
