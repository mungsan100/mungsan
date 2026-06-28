import { describe, expect, it } from 'vitest';

import { sortKeyBetween, SORT_KEY_DIGITS } from './sort-key';

// 결정론적 LCG — 테스트 재현성을 위해 Math.random 대신.
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// 성공 경로 헬퍼 — 이 테스트들의 입력은 항상 유효해 ok 가 보장된다.
const between = (a: string | null, b: string | null): string => sortKeyBetween(a, b)._unsafeUnwrap();

const isPureDigits = (k: string) => /^[0-9]+$/.test(k);
const noTrailingZero = (k: string) => k.length > 0 && !k.endsWith('0');

describe('sortKeyBetween', () => {
  it('첫 키는 "5" (양쪽 여유)', () => {
    expect(between(null, null)).toBe('5');
  });

  it('결과는 항상 순수 숫자 + trailing zero 없음 (collation 무관 보장)', () => {
    const keys = [
      between(null, null),
      between('5', null),
      between(null, '5'),
      between('1', '2'),
      between('19', '2'),
    ];
    for (const k of keys) {
      expect(isPureDigits(k)).toBe(true);
      expect(noTrailingZero(k)).toBe(true);
    }
  });

  it('letter가 절대 등장하지 않는다 (대문자 헤더 부재 — collation 안전의 핵심)', () => {
    // 맨 앞으로 1000번 prepend 해도 letter 없이 앞자리 0만 늘어난다.
    let first = between(null, null);
    for (let i = 0; i < 1000; i++) {
      const next = between(null, first);
      expect(isPureDigits(next)).toBe(true);
      expect(next < first).toBe(true); // 사전식으로 더 앞
      first = next;
    }
  });

  it('append 체인은 사전식으로 단조 증가', () => {
    let prev: string | null = null;
    let last = '';
    for (let i = 0; i < 1000; i++) {
      const k = between(prev, null);
      if (prev !== null) expect(k > last).toBe(true);
      last = k;
      prev = k;
    }
  });

  it('사이 삽입 결과는 두 경계 사이에 엄격히 위치', () => {
    const cases: [string, string][] = [
      ['1', '2'],
      ['5', '6'],
      ['19', '2'],
      ['1', '15'],
      ['11', '12'],
    ];
    for (const [a, b] of cases) {
      const m = between(a, b);
      expect(a < m).toBe(true);
      expect(m < b).toBe(true);
      expect(isPureDigits(m)).toBe(true);
      expect(noTrailingZero(m)).toBe(true);
    }
  });

  it('경계가 같으면 EQUAL_BOUNDS err', () => {
    const r = sortKeyBetween('5', '5');
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().code).toBe('EQUAL_BOUNDS');
  });

  it('경계 역순이면 REVERSED_BOUNDS err', () => {
    const r = sortKeyBetween('8', '2');
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().code).toBe('REVERSED_BOUNDS');
  });

  it('잘못된 키 입력이면 INVALID_KEY err', () => {
    for (const bad of ['', '50', 'a1']) {
      // '': 빈 문자열, '50': trailing zero, 'a1': letter
      const r = sortKeyBetween(bad, null);
      expect(r.isErr()).toBe(true);
      expect(r._unsafeUnwrapErr().code).toBe('INVALID_KEY');
    }
  });

  // 스트레스: 임의 위치(양 끝 포함)에 반복 삽입해도 리스트가 사전식 정렬을 유지하는지.
  it('랜덤 삽입 5000회 후에도 사전식 순서가 논리 순서와 일치', () => {
    const rand = lcg(42);
    const list: string[] = [between(null, null)];
    for (let i = 0; i < 5000; i++) {
      const idx = Math.floor(rand() * (list.length + 1)); // 0..list.length
      const a = idx === 0 ? null : list[idx - 1];
      const b = idx === list.length ? null : list[idx];
      const k = between(a, b);
      expect(isPureDigits(k)).toBe(true);
      expect(noTrailingZero(k)).toBe(true);
      list.splice(idx, 0, k);
    }
    // 삽입 순서가 곧 논리 순서 → 사전식 정렬과 동일해야 한다.
    const sorted = [...list].sort();
    expect(sorted).toEqual(list);
    // 중복 키 없음.
    expect(new Set(list).size).toBe(list.length);
  });

  it('DIGITS는 0-9', () => {
    expect(SORT_KEY_DIGITS).toBe('0123456789');
  });
});
