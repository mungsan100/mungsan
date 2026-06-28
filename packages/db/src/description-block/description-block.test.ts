import { describe, expect, it } from 'vitest';

import { parseDescriptionBlocks, type DescriptionBlock } from './description-block';

describe('parseDescriptionBlocks', () => {
  it('배열이 아니면 빈 배열', () => {
    expect(parseDescriptionBlocks(null)).toEqual([]);
    expect(parseDescriptionBlocks(undefined)).toEqual([]);
    expect(parseDescriptionBlocks({})).toEqual([]);
    expect(parseDescriptionBlocks('x')).toEqual([]);
  });

  it('text 블록 — text 가 문자열일 때만 통과(빈 문자열도 보존)', () => {
    expect(parseDescriptionBlocks([{ type: 'text', text: '안녕' }])).toEqual([
      { type: 'text', text: '안녕' },
    ]);
    expect(parseDescriptionBlocks([{ type: 'text', text: '' }])).toEqual([{ type: 'text', text: '' }]);
    expect(parseDescriptionBlocks([{ type: 'text' }])).toEqual([]);
    expect(parseDescriptionBlocks([{ type: 'text', text: 3 }])).toEqual([]);
  });

  it('image 블록 — src 필수, name/size 는 타입 맞을 때만 채택', () => {
    expect(
      parseDescriptionBlocks([{ type: 'image', src: 'https://x/y.jpg', name: 'y', size: 100 }]),
    ).toEqual([{ type: 'image', src: 'https://x/y.jpg', name: 'y', size: 100 }]);
    expect(parseDescriptionBlocks([{ type: 'image', src: 'https://x/y.jpg' }])).toEqual([
      { type: 'image', src: 'https://x/y.jpg' },
    ]);
    // src 누락/빈값/비문자 → 버림
    expect(parseDescriptionBlocks([{ type: 'image' }])).toEqual([]);
    expect(parseDescriptionBlocks([{ type: 'image', src: '' }])).toEqual([]);
    // name/size 타입 불일치는 해당 옵션 필드만 무시
    expect(parseDescriptionBlocks([{ type: 'image', src: 's', name: 1, size: 'big' }])).toEqual([
      { type: 'image', src: 's' },
    ]);
  });

  it('recommendedFor 블록 — 비어있지 않은 문자열 불릿만, ≥1 없으면 버림', () => {
    expect(
      parseDescriptionBlocks([{ type: 'recommendedFor', bullets: ['a', '', '  ', 'b', 7] }]),
    ).toEqual([{ type: 'recommendedFor', bullets: ['a', 'b'] }]);
    // 유효 불릿 0개 → 블록 버림
    expect(parseDescriptionBlocks([{ type: 'recommendedFor', bullets: ['', '   '] }])).toEqual([]);
    expect(parseDescriptionBlocks([{ type: 'recommendedFor', bullets: [] }])).toEqual([]);
    expect(parseDescriptionBlocks([{ type: 'recommendedFor' }])).toEqual([]);
  });

  it('알 수 없는 type·null 요소는 버리고 나머지는 보존(순서 유지)', () => {
    const input = [
      { type: 'text', text: '1' },
      null,
      { type: 'unknown' },
      { type: 'image', src: 's' },
      { type: 'recommendedFor', bullets: ['x'] },
    ];
    const out: DescriptionBlock[] = parseDescriptionBlocks(input);
    expect(out).toEqual([
      { type: 'text', text: '1' },
      { type: 'image', src: 's' },
      { type: 'recommendedFor', bullets: ['x'] },
    ]);
  });
});
