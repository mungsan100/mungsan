// ============================================================================
// Wildcard 매핑 컴파일
// ----------------------------------------------------------------------------
// 옵션 형태: { from: 'apps/web/*', to: '@/*' }
//   - '*'는 임의의 문자열 캡처 그룹
//   - '*'의 개수와 순서가 from/to에서 일치해야 함
//
// 컴파일 결과로 양방향 변환에 필요한 4개 객체를 만든다:
//   - fromRegex     : 정규화 경로 매칭용
//   - toTemplate    : 매칭된 캡처를 alias로 치환할 replacement
//   - toRegex       : alias 매칭용
//   - fromTemplate  : 매칭된 캡처를 정규화 경로로 치환할 replacement
// ============================================================================

/**
 * @typedef {{ from: string; to: string }} RawMapping
 * @typedef {{
 *   raw: RawMapping;
 *   fromRegex: RegExp;
 *   toTemplate: string;
 *   toRegex: RegExp;
 *   fromTemplate: string;
 * }} CompiledMapping
 */

/**
 * @param {string} input
 * @returns {string}
 */
export function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} pattern
 * @returns {RegExp}
 */
export function wildcardToRegex(pattern) {
  const escaped = escapeRegex(pattern).replace(/\\\*/g, '(.*)');
  return new RegExp(`^${escaped}$`);
}

/**
 * @param {string} pattern
 * @returns {string}
 */
export function wildcardToTemplate(pattern) {
  let n = 0;
  return pattern.replace(/\*/g, () => `$${++n}`);
}

/**
 * @param {string} pattern
 * @returns {number}
 */
export function countWildcards(pattern) {
  return (pattern.match(/\*/g) || []).length;
}

/**
 * @param {RawMapping} rawMapping
 * @param {number} index
 * @returns {CompiledMapping}
 */
export function compileMapping(rawMapping, index) {
  const { from, to } = rawMapping;
  if (typeof from !== 'string' || typeof to !== 'string') {
    throw new Error(`mappings[${index}]: 'from'과 'to'는 모두 문자열이어야 합니다.`);
  }
  if (countWildcards(from) !== countWildcards(to)) {
    throw new Error(
      `mappings[${index}]: 'from'과 'to'의 와일드카드(*) 개수가 일치하지 않습니다. (from="${from}", to="${to}")`,
    );
  }
  return {
    raw: { from, to },
    fromRegex: wildcardToRegex(from),
    toTemplate: wildcardToTemplate(to),
    toRegex: wildcardToRegex(to),
    fromTemplate: wildcardToTemplate(from),
  };
}

/**
 * @param {RawMapping[]} rawMappings
 * @returns {CompiledMapping[]}
 */
export function compileMappings(rawMappings) {
  return rawMappings.map((m, i) => compileMapping(m, i));
}
