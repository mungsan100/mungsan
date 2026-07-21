'use server';

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { extractBusinessCard, type ExtractedCard } from '@/lib/business-card/extract';

export type ScanResult =
  | { ok: true; data: ExtractedCard }
  | { ok: false; message: string };

// 명함 이미지 인식(2026-07-21) — 로그인 회원만. 저장은 하지 않고 추출 결과만 돌려준다
// (미리보기에서 수정 후 create 로 저장). AI 실패 시엔 빈 값으로 반환돼 수동 입력이 가능하다.
export async function scanBusinessCardAction(imageDataUrl: string): Promise<ScanResult> {
  await getCurrentUser(); // 인증 게이트(미로그인은 throw)

  if (typeof imageDataUrl !== 'string' || !/^data:image\/\w+;base64,/.test(imageDataUrl))
    return { ok: false, message: '이미지를 다시 선택해 주세요.' };

  const data = await extractBusinessCard(imageDataUrl);
  return { ok: true, data };
}
