import { LuLock, LuUsers } from 'react-icons/lu';

import { Badge } from '@/components/ui/badge';

import type { ProjectBanner as ProjectBannerData } from '../mock';

// 헤더 그린 위에 얹히는 더 어두운 그린 카드 — 협업 프로젝트 식별 배너.
interface ProjectBannerProps {
  banner: ProjectBannerData;
}

export const ProjectBanner = ({ banner }: ProjectBannerProps) => {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-black/15 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
        <LuUsers className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-white">{banner.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[12px] text-white/70">
          <LuLock className="h-3 w-3 shrink-0" />
          {banner.subtitle}
        </p>
      </div>
      <Badge
        variant="outline"
        size="md"
        className="border-emerald-300/50 bg-emerald-400/10 text-emerald-100"
      >
        {banner.status}
      </Badge>
    </div>
  );
};
