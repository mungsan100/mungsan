'use client';

import { LuDownload } from 'react-icons/lu';
import { toast } from 'sonner';

// 리포트 다운로드 — 파일 서빙은 아직 미구현이라 준비 안내 토스트로 실제 피드백을 준다(죽은 버튼 금지).
// 2026-07-22 문구 확정: "곧 될 것 같은" 뉘앙스 대신 기능 자체가 준비 중임을 명확히(사장님 승인 단기안).
// 파일명은 더 이상 문구에 쓰지 않아 prop 도 제거했다.
export const ReportDownloadButton = () => (
  <button
    type="button"
    onClick={() => toast.info('파일 다운로드 기능은 준비 중입니다')}
    aria-label="리포트 다운로드"
    className="bg-ink-100 text-ink-500 hover:bg-ink-200 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
  >
    <LuDownload className="h-4 w-4" />
  </button>
);
