import { BackHeader } from '../ui/back-header';

// 도움말(IA 2차) — 더보기 > 도움말. 자주 묻는 질문 정적 안내.
const FAQS: { q: string; a: string }[] = [
  {
    q: '가입 심사는 얼마나 걸리나요?',
    a: '제출하신 사업자등록증·대표자 정보를 운영팀이 확인합니다. 보통 1~2 영업일 내에 심사 결과를 알림으로 안내드립니다.',
  },
  {
    q: '라운지에 글을 쓰면 실명이 보이나요?',
    a: '아니요. 라운지 게시글·댓글에는 실명 대신 자동 생성된 닉네임(가명)만 표시됩니다. 닉네임은 설정에서 바꿀 수 있어요.',
  },
  {
    q: '협업 제안은 어떻게 보내나요?',
    a: '협업 마켓에서 관심 있는 공고의 상세로 들어가 제안을 작성하면, 내 회사 정보와 함께 상대 기업에 전달됩니다. 받은/보낸 제안은 내 정보 탭에서 확인할 수 있어요.',
  },
  {
    q: '신뢰 지수는 어떻게 올리나요?',
    a: '회사 프로필을 충실히 채우고, 라운지·협업 활동을 하고, 받은 제안에 성실히 응답하고, 협업 프로젝트에 참여할수록 올라갑니다.',
  },
  {
    q: '더 궁금한 점이 있어요.',
    a: '더보기 > 1:1 문의로 남겨 주시면 가입하신 이메일로 답변드립니다. 급하면 mungsan100@gmail.com 으로 직접 메일 주셔도 됩니다.',
  },
];

export default function HelpPage() {
  return (
    <>
      <BackHeader />
      <main className="space-y-4 px-5 pt-3 pb-24">
        <h1 className="text-ink-900 text-xl font-bold">도움말</h1>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="shadow-card rounded-2xl bg-white p-4">
              <p className="text-ink-900 text-[15px] font-bold">Q. {faq.q}</p>
              <p className="text-ink-600 mt-2 text-[13px] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
