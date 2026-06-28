import type { ReactNode } from 'react';
import {
  LuChevronRight,
  LuCircleCheck,
  LuEye,
  LuEyeOff,
  LuLock,
  LuShield,
} from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import type { Proposal, ProposalStatus } from '../mock';

// 제안 발송 상태 → 배지 라벨/색/아이콘 매핑.
const STATUS_META: Record<
  ProposalStatus,
  { label: string; variant: 'success' | 'secondary'; icon: ReactNode }
> = {
  viewed: { label: '열람됨', variant: 'success', icon: <LuEye className="h-3 w-3" /> },
  unread: { label: '미열람', variant: 'secondary', icon: <LuEyeOff className="h-3 w-3" /> },
  replied: {
    label: '회신 완료',
    variant: 'success',
    icon: <LuCircleCheck className="h-3 w-3" />,
  },
};

interface ProposalSectionProps {
  proposals: Proposal[];
}

export const ProposalSection = ({ proposals }: ProposalSectionProps) => {
  return (
    <section className="px-5">
      <SectionHeader
        icon={<LuLock className="h-[18px] w-[18px]" />}
        title="제안 관리"
        action={{ label: '전체보기' }}
      />
      <div className="mt-3 space-y-3">
        {proposals.map((proposal) => {
          const status = STATUS_META[proposal.status];
          return (
            <Card key={proposal.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-ink-900 text-[15px] font-bold">{proposal.company}</h3>
                  <Badge variant={status.variant}>
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
                <p className="text-ink-700 mt-1 text-sm">{proposal.title}</p>
                <div className="text-ink-400 mt-2 flex items-center gap-1.5 text-[12px]">
                  <span>발송 {proposal.sentLabel}</span>
                  <span>·</span>
                  <LuShield className="h-3.5 w-3.5" />
                  <span>보안 보호 중</span>
                </div>
              </div>
              <LuChevronRight className="text-ink-300 h-5 w-5 shrink-0" />
            </Card>
          );
        })}
      </div>
    </section>
  );
};
