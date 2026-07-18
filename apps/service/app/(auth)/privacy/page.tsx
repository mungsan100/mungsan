import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

// ⚠ 임시 문서 — 정식 법률 검토 전 표준 템플릿 기반 초안이다. 서비스 오픈 전 반드시
// 개인정보보호 법무 검토를 거친 정식 처리방침으로 교체할 것(처리방침은 수집 실태와
// 일치해야 함 — 수집 항목이 바뀌면 이 문서도 함께 갱신).
export default function PrivacyPage() {
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
        <h1 className="text-ink-900 text-xl font-bold">개인정보처리방침</h1>
        <p className="text-ink-400 text-xs">시행일: 2026-07-15 (버전 2026-07-15)</p>
      </div>

      <div className="text-ink-700 space-y-5 text-sm leading-relaxed">
        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">1. 수집하는 개인정보 항목</h2>
          <p>
            회원가입 및 기업 인증 과정에서 다음 정보를 수집합니다: 이름, 연락처, 이메일, 직책,
            회사명, 사업자등록번호, 업종, 사업자등록증 등 증빙 서류(파일). 서비스 이용 과정에서
            접속 기록 등이 자동으로 생성·수집될 수 있습니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">2. 수집·이용 목적</h2>
          <p>
            기업 대표·임원 여부 확인(가입 심사), 회원 관리 및 본인 확인, 협업 제안 등 서비스
            제공, 비밀번호 재설정 등 계정 보호, 법령상 의무 이행을 위해 이용합니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">3. 보유 및 이용 기간</h2>
          <p>
            회원 탈퇴 시 지체 없이 파기하는 것을 원칙으로 하되, 관련 법령(전자상거래법 등)에
            따라 보존이 필요한 정보는 해당 법령이 정한 기간 동안 분리 보관 후 파기합니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">4. 제3자 제공 및 처리 위탁</h2>
          <p>
            회사는 회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 서비스 운영을 위해
            클라우드 인프라(호스팅·데이터베이스·파일 저장) 및 이메일 발송 업무를 외부 사업자에
            위탁할 수 있으며, 위탁 시 관련 법령에 따라 안전하게 관리합니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">5. 정보주체의 권리</h2>
          <p>
            회원은 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있으며,
            서비스 내 탈퇴 기능 또는 운영팀 문의를 통해 행사할 수 있습니다.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-ink-900 font-bold">6. 개인정보의 안전성 확보 조치</h2>
          <p>
            비밀번호는 일방향 암호화하여 저장하고, 사업자등록증 등 민감 파일은 비공개 저장소에
            보관하며 인증·인가된 경우에만 시간제한 링크로 접근할 수 있습니다. 전송 구간은 TLS로
            보호합니다.
          </p>
        </section>

        <p className="text-ink-400 text-xs">
          개인정보 보호책임자 및 문의: 운영팀. 본 방침은 법령·서비스 변경에 따라 개정될 수
          있으며, 개정 시 시행일과 함께 공지합니다.
        </p>
      </div>
    </div>
  );
}
