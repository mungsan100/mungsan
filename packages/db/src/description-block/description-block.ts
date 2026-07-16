// 크립 상세 소개 블록의 저장 형태(DescriptionBlock) — Crip.descriptionBlocks(Json) 한 칸에 배열로 담는다.
//
// descriptionBlocks 는 정규화하지 않는다(자식 테이블 X). Editor.js·Portable Text 관례대로 "렌더 전용
// 문서"를 JSON 컬럼에 통째로 싣는다 — 쿼리 술어로 블록을 뒤질 일이 없으므로 정규화 이득이 없다.
// 그래서 "정형화"는 DB가 아니라 이 타입 레이어에서 한다: 3앱에 중복돼 있던 DescriptionBlock 정의와
// `as unknown as DescriptionBlock[]` 무검증 캐스트를, 이 단일 정의 + parseDescriptionBlocks 로 대체한다.
//
// 프레임워크 프리(zod·neverthrow 등 의존 없음) — packages/db 는 앱 프레임워크를 모른다. 검증은
// 손으로 짠 가벼운 가드로 충분하다(읽기 경로는 렌더용이라 깨진 블록은 조용히 버리는 게 옳다).

/** DB(Crip.descriptionBlocks)에 저장되는 상세 소개 블록 한 칸. ui 전용 필드(id·업로드 상태 등)는 제외된 형태. */
export type DescriptionBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; name?: string; size?: number }
  // "이런 분께 추천해요" 불릿 목록. 불릿 ≥1 불변식을 타입으로 강제한다(NonEmpty 튜플) —
  // 빈 추천 블록은 의미가 없다. 고정 개수는 아니다(1개 이상이면 된다).
  | { type: 'recommendedFor'; bullets: [string, ...string[]] };

/**
 * Json 컬럼(unknown)에서 읽어온 값을 DescriptionBlock[] 으로 관대하게 파싱한다.
 * - 배열이 아니면 [] 반환.
 * - 형식에 맞지 않는 블록은 조용히 버린다(읽기=렌더 경로라 throw 대신 누락이 안전).
 * - recommendedFor 는 비어있지 않은 문자열 불릿만 남기고, 하나도 안 남으면 블록을 버린다(≥1 불변식).
 *
 * 쓰기 경로는 이미 검증된 에디터 데이터를 넣으므로 이 파서를 거치지 않는다(타입만 공유).
 */
export function parseDescriptionBlocks(value: unknown): DescriptionBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw): DescriptionBlock[] => {
    const block = parseDescriptionBlock(raw);
    return block ? [block] : [];
  });
}

function parseDescriptionBlock(raw: unknown): DescriptionBlock | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const b = raw as Record<string, unknown>;

  if (b.type === 'text') {
    return typeof b.text === 'string' ? { type: 'text', text: b.text } : null;
  }

  if (b.type === 'image') {
    if (typeof b.src !== 'string' || b.src === '') return null;
    const image: DescriptionBlock = { type: 'image', src: b.src };
    if (typeof b.name === 'string') image.name = b.name;
    if (typeof b.size === 'number') image.size = b.size;
    return image;
  }

  if (b.type === 'recommendedFor') {
    if (!Array.isArray(b.bullets)) return null;
    const bullets = b.bullets.filter((x): x is string => typeof x === 'string' && x.trim() !== '');
    // ≥1 불변식: 유효 불릿이 하나도 없으면 블록 자체를 버린다.
    if (bullets.length === 0) return null;
    return { type: 'recommendedFor', bullets: bullets as [string, ...string[]] };
  }

  return null;
}
