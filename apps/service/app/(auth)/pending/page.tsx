import { Button } from '@/components/ui/button';
import { logoutAction } from '@/app/(auth)/pending/commands/logout.action';

export default function PendingPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-ink-900 text-xl font-bold">가입심사중입니다</h1>
        <p className="text-ink-500 text-sm">
          제출하신 기업정보를 확인하고 있습니다. 승인이 완료되면 서비스를 이용하실 수 있어요.
        </p>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="lg" className="w-full">
          로그아웃
        </Button>
      </form>
    </div>
  );
}
