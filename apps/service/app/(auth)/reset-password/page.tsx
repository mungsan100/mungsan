import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

import { RequestResetForm } from '@/app/(auth)/reset-password/ui/request-reset-form';

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="text-ink-500 hover:text-ink-900 -ml-1 inline-flex items-center gap-0.5 text-sm"
      >
        <LuChevronLeft className="h-4 w-4" />
        로그인 화면으로
      </Link>
      <div className="space-y-1 text-center">
        <h1 className="text-ink-900 text-xl font-bold">비밀번호 재설정</h1>
        <p className="text-ink-500 text-sm">
          가입하신 이메일을 입력하시면 재설정 링크를 보내드립니다.
        </p>
      </div>
      <RequestResetForm />
    </div>
  );
}
