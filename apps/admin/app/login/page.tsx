import { AdminLoginForm } from '@/app/login/ui/admin-login-form';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-slate-900">뭉산 운영 백오피스</h1>
          <p className="text-sm text-slate-500">관리자 계정으로 로그인해 주세요.</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
