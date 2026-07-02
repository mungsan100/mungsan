import { LuInbox } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';
import { getCurrentUser } from '@/lib/auth/get-current-user';

import { getManageProposalsQuery } from '../queries/manage-proposals.query';
import { ProposalRow } from './proposal-row';

// 받은 제안 — 내 공고가 받은 제안 실목록. 행 클릭 시 열람 처리 후 공고 상세로 이동(ProposalRow).
export async function ProposalSection() {
  const user = await getCurrentUser();
  const proposals = await getManageProposalsQuery(user.id);

  return (
    <section className="px-5">
      <SectionHeader icon={<LuInbox className="h-[18px] w-[18px]" />} title="받은 제안" />
      <div className="mt-3 space-y-3">
        {proposals.length === 0 ? (
          <p className="text-ink-400 py-8 text-center text-sm">아직 받은 제안이 없습니다.</p>
        ) : (
          proposals.map((proposal) => <ProposalRow key={proposal.id} proposal={proposal} />)
        )}
      </div>
    </section>
  );
}
