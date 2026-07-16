import { SignupForm } from '@/app/(auth)/signup/ui/signup-form';

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-ink-900 text-xl font-bold">회원가입</h1>
        <p className="text-ink-500 text-sm">검증된 대표·임원을 위한 뭉산에 오신 것을 환영합니다.</p>
      </div>
      <SignupForm />
    </div>
  );
}
