import { LoginForm } from './ui/login-form';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-ink-900 text-xl font-bold">로그인</h1>
        <p className="text-ink-500 text-sm">뭉산에 다시 오신 것을 환영합니다.</p>
      </div>
      <LoginForm />
    </div>
  );
}
