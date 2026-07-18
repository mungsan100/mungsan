import { ResetPasswordForm } from '@/app/(auth)/reset-password/ui/reset-password-form';

// 메일 링크로 진입하는 새 비밀번호 설정 화면. 토큰 유효성은 제출 시 액션에서 검증한다
// (만료/사용됨이면 액션이 안내 메시지를 반환).
export default async function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-ink-900 text-xl font-bold">새 비밀번호 설정</h1>
        <p className="text-ink-500 text-sm">사용하실 새 비밀번호를 입력해 주세요.</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
