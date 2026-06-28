// 순수 자릿수(0-9) fractional 정렬키.
//
// 알파벳을 '0'-'9'로만 한정한다 → 숫자는 모든 PostgreSQL collation(C·en_US·ICU)에서
// 동일하게 정렬되므로 컬럼에 `COLLATE "C"`를 걸지 않아도 `ORDER BY sort`가 항상 옳다.
// fractional-indexing 라이브러리가 collation에 취약한 원인은 키를 짧게 유지하려고 도입한
// "정수부 헤더"가 대문자(A-Z)까지 쓰기 때문인데(case-fold collation에서 깨짐), 여기서는
// 그 헤더 레이어를 제거하고 검증된 midpoint 코어만 자릿수 전용으로 가져왔다. 그 결과
// 맨 앞 삽입(prepend)도 letter 대신 앞자리 '0'을 덧붙이는 식이라 letter가 영영 등장하지 않는다.
//
// 모델: 키 s를 10진 소수 0.s 로 해석한다("5"=0.5, "05"=0.05). trailing '0'을 금지해
// (사전식 비교 = 수치 비교)를 보장한다 — "5"(0.5)와 "50"(0.50)이 수치는 같지만 사전식은 다르기 때문.
// 따라서 모든 키는 비어있지 않고 '0'으로 끝나지 않으며 (0,1) 구간에 든다.

import { type Result, err, ok } from 'neverthrow';

export const SORT_KEY_DIGITS = '0123456789';

const ZERO = SORT_KEY_DIGITS[0];

// sortKeyBetween 실패 사유. code 는 머신 식별용, message 는 디버깅 컨텍스트.
export type SortKeyErr =
  | { code: 'EQUAL_BOUNDS'; message: string }
  | { code: 'REVERSED_BOUNDS'; message: string }
  | { code: 'INVALID_KEY'; message: string };

/**
 * a < 결과 < b 인 정렬키를 ok(key) 로 반환한다. a=null 은 하한(맨 앞에 삽입), b=null 은 상한(맨 뒤에 추가).
 * - 첫 키: sortKeyBetween(null, null) → ok("5")
 * - 맨 뒤 추가: sortKeyBetween(lastKey, null)
 * - 맨 앞 삽입: sortKeyBetween(null, firstKey)
 * - 사이 삽입: sortKeyBetween(prevKey, nextKey)
 *
 * 실패는 err(SortKeyErr). 각 code 의 의미와 조치는 본문 주석 참고.
 * (이 함수는 순수·결정적이라 "동시 삽입으로 같은 midpoint 가 중복 저장"되는 충돌은 못 잡는다 —
 *  그건 DB 의 unique 제약 + insert 시점 P2002 에서 잡는 별개 레이어다.)
 */
export function sortKeyBetween(
  a: string | null,
  b: string | null,
): Result<string, SortKeyErr> {
  // INVALID_KEY: 전달/저장된 키가 형식 위반(빈 문자열·비숫자·trailing '0').
  //   원인은 데이터 손상 또는 키 생성 코드 버그(특히 a 는 DB 에서 읽은 값일 수 있다).
  //   조치: 재시도 무의미 — 해당 row 의 sort 를 로깅·점검하고 그 구간을 재배치(rebalance)로 복구.
  if (a !== null && !isValidKey(a)) {
    return err({ code: 'INVALID_KEY', message: `invalid lower bound: ${JSON.stringify(a)}` });
  }
  if (b !== null && !isValidKey(b)) {
    return err({ code: 'INVALID_KEY', message: `invalid upper bound: ${JSON.stringify(b)}` });
  }
  if (a !== null && b !== null) {
    // EQUAL_BOUNDS: 두 이웃의 키가 동일 = 이미 중복 키가 존재(과거 동시 삽입의 잔재).
    //   사이에 새 키를 끼울 수 없다. 조치: 재시도 무의미(입력이 같으면 결과도 같다) —
    //   해당 구간을 재배치(rebalance)해 키를 다시 매겨야 한다.
    if (a === b) {
      return err({ code: 'EQUAL_BOUNDS', message: `equal bounds: ${a} === ${b}` });
    }
    // REVERSED_BOUNDS: 하한이 상한보다 큼 = 인자 순서가 뒤바뀌었거나 stale 한 이웃을 읽음.
    //   조치: 이웃을 다시 조회해 재시도. 그래도 역순이면 리스트 정렬 자체가 손상된 것 —
    //   정렬 복구(재배치)가 필요하다.
    if (a > b) {
      return err({ code: 'REVERSED_BOUNDS', message: `bounds out of order: ${a} > ${b}` });
    }
  }
  return ok(midpoint(a ?? '', b));
}

function isValidKey(key: string): boolean {
  return key !== '' && /^[0-9]+$/.test(key) && !key.endsWith(ZERO);
}

// a(빈 문자열은 하한 0) 와 b(null은 상한 1) "사이"의 자릿수 문자열을 반환한다.
// 입력에 trailing '0'이 없다는 전제하에 결과도 trailing '0'이 없다.
function midpoint(a: string, b: string | null): string {
  if (b !== null && a >= b) throw new Error(`${a} >= ${b}`);

  // 공통 접두는 그대로 두고 나머지 구간에서 중점을 찾는다.
  if (b !== null) {
    let n = 0;
    while ((a[n] ?? ZERO) === b[n] && n < b.length) n++;
    if (n > 0) return b.slice(0, n) + midpoint(a.slice(n), b.slice(n));
  }

  const digitA = a === '' ? 0 : digitOf(a[0]);
  const digitB = b !== null ? digitOf(b[0]) : SORT_KEY_DIGITS.length;

  // 첫 자리 사이에 빈 자리가 있으면 그 중간 자리를 쓴다.
  if (digitB - digitA > 1) {
    const mid = Math.round(0.5 * (digitA + digitB));
    return SORT_KEY_DIGITS[mid];
  }

  // 첫 자리가 연속/동일 → 한 자리 더 내려가서 중점을 찾는다.
  if (b !== null && b.length > 1) return b.slice(0, 1);
  return SORT_KEY_DIGITS[digitA] + midpoint(a.slice(1), null);
}

function digitOf(ch: string): number {
  return SORT_KEY_DIGITS.indexOf(ch);
}
