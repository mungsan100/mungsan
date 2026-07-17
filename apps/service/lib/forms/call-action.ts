import { toast } from 'sonner';

// 서버 액션 호출 래퍼(client 폼 전용) — 액션 "호출 자체"의 실패(본문 한도 초과로 서버가
// 연결을 끊는 400, 네트워크 단절 등)를 토스트로 노출한다. 잡지 않으면 unhandled rejection으로
// 끝나 사용자에겐 폼이 아무 반응 없이 멈춘 것처럼 보인다(아이폰 기업정보 등록 멈춤 버그의 원인).
// redirect()가 만드는 Next 내부 예외(digest: NEXT_REDIRECT)는 라우터가 처리해야 하므로 재던진다.
// 실패 시 null 반환 — 호출부는 null이면 그대로 return.
export async function callAction<T>(fn: () => Promise<T>, failMessage: string): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'digest' in err &&
      String((err as { digest: unknown }).digest).startsWith('NEXT_REDIRECT')
    )
      throw err;
    toast.error(failMessage);
    return null;
  }
}
