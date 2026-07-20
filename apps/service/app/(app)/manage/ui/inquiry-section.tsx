import { LuHeadset } from 'react-icons/lu';

import { SectionHeader } from '@/components/section-header';

import { InquiryForm } from './inquiry-form';

// 운영팀에 노출하는 고객센터 이메일(2026-07-20 결정) — 폼 접수와 함께 직접 메일 경로도 안내.
const SUPPORT_EMAIL = 'mungsan100@gmail.com';

// 문의하기 섹션 — 접수 폼(로그인 회원) + 직접 이메일 병기. 오류·불편을 알릴 공식 창구.
export function InquirySection() {
  return (
    <section className="px-5">
      <SectionHeader icon={<LuHeadset className="h-[18px] w-[18px]" />} title="문의하기" />
      <div className="shadow-card mt-3 space-y-4 rounded-2xl bg-white p-4">
        <p className="text-ink-500 text-[13px] leading-relaxed">
          서비스 이용 중 불편하거나 궁금한 점을 남겨 주세요. 확인 후 가입하신 이메일로 답변드립니다.
        </p>
        <InquiryForm />
        <p className="text-ink-400 border-ink-100 border-t pt-3 text-[12px]">
          급한 문의는 <span className="text-ink-600 font-semibold">{SUPPORT_EMAIL}</span> 으로 직접
          메일 주셔도 됩니다.
        </p>
      </div>
    </section>
  );
}
