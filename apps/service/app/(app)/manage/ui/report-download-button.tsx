'use client';

import { LuDownload } from 'react-icons/lu';
import { toast } from 'sonner';

// 리포트 다운로드 — 파일 서빙은 아직 미구현이라 준비 안내 토스트로 실제 피드백을 준다(죽은 버튼 금지).
export const ReportDownloadButton = ({ fileName }: { fileName: string }) => (
  <button
    type="button"
    onClick={() => toast.info(`「${fileName}」 다운로드를 준비 중입니다`)}
    aria-label="리포트 다운로드"
    className="bg-ink-100 text-ink-500 hover:bg-ink-200 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
  >
    <LuDownload className="h-4 w-4" />
  </button>
);
