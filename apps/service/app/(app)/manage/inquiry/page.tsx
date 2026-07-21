import { BackHeader } from '../../ui/back-header';
import { InquirySection } from '../ui/inquiry-section';

// 1:1 문의 페이지(IA 2차) — 더보기 > 1:1 문의. 기존 문의 접수 폼을 독립 페이지로.
export default function InquiryPage() {
  return (
    <>
      <BackHeader />
      <div className="pt-3 pb-24">
        <InquirySection />
      </div>
    </>
  );
}
