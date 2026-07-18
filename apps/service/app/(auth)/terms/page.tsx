import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

// ⚠ 임시 문서 — 정식 법률 검토 전 표준 템플릿 기반 초안이다. 서비스 오픈 전 반드시
// 법무 검토를 거친 정식 약관으로 교체할 것. 시행일·버전은 signup.action의
// TERMS_VERSION('2026-07-15')과 함께 관리한다(개정 시 둘 다 갱신).
export default function TermsPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/signup"
        className="text-ink-500 hover:text-ink-900 -ml-1 inline-flex items-center gap-0.5 text-sm"
      >
        <LuChevronLeft className="h-4 w-4" />
        돌아가기
      </Link>
      <div className="space-y-1">
        <h1 className="text-ink-900 text-xl font-bold">이용약관</h1>
        <p className="text-ink-400 text-xs">시행일: 2026-07-15 (버전 2026-07-15)</p>
      </div>

      <div className="text-ink-700 space-y-5 text-sm leading-relaxed">
        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">제1조 (목적)</h2>
          <p>
            이 약관은 뭉산(이하 &quot;회사&quot;)이 제공하는 B2B 협업 파트너 플랫폼 서비스(이하
            &quot;서비스&quot;)의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 정함을
            목적으로 합니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">제2조 (회원가입 및 심사)</h2>
          <p>
            서비스는 기업의 대표 또는 임원을 위한 플랫폼으로, 회원가입 시 기업 정보와 증빙
            서류(사업자등록증 등)를 제출해야 하며, 회사의 심사를 거쳐 승인된 경우에만 서비스를
            이용할 수 있습니다. 제출 정보가 사실과 다른 경우 승인이 거절되거나 이용이 제한될 수
            있습니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">제3조 (계정 관리)</h2>
          <p>
            계정과 비밀번호의 관리 책임은 회원에게 있으며, 제3자에게 양도하거나 대여할 수
            없습니다. 계정 도용이 의심되는 경우 즉시 회사에 알려야 합니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">제4조 (게시물과 금지행위)</h2>
          <p>
            회원이 서비스에 게시한 콘텐츠의 책임은 회원에게 있습니다. 타인의 권리 침해, 허위
            정보 유포, 법령 위반 게시물, 서비스의 정상 운영을 방해하는 행위는 금지되며, 위반 시
            게시물 삭제·이용 정지 등의 조치가 있을 수 있습니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">제5조 (서비스의 변경 및 중단)</h2>
          <p>
            회사는 운영상·기술상 필요에 따라 서비스의 내용을 변경하거나 중단할 수 있으며, 중요한
            변경은 사전에 공지합니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">제6조 (탈퇴 및 자격 상실)</h2>
          <p>
            회원은 언제든지 서비스 내 탈퇴 기능을 통해 이용계약을 해지할 수 있습니다. 탈퇴 시
            계정은 비활성화되며, 관련 법령에 따라 보존해야 하는 정보는 정해진 기간 동안 보관 후
            파기됩니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">제7조 (면책 및 분쟁 해결)</h2>
          <p>
            회사는 회원 간 협업·거래의 당사자가 아니며, 회원 상호 간 발생한 분쟁에 대해 관련
            법령이 정한 범위 내에서 책임을 부담합니다. 이 약관은 대한민국 법률에 따라 해석되며,
            분쟁은 민사소송법상 관할 법원에 제기합니다.
          </p>
        </section>

        <p className="text-ink-400 text-xs">
          본 약관에 정하지 않은 사항은 관련 법령 및 상관례에 따릅니다. 문의: 운영팀
        </p>
      </div>
    </div>
  );
}
