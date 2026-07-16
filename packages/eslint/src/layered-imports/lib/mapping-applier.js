// ============================================================================
// 정규화 경로 → alias 변환 (정방향 매핑 적용)
// ----------------------------------------------------------------------------
// 첫 번째로 매칭되는 매핑을 사용한다.
// 매핑이 없으면 null 반환 → 보고하지 않음.
// ============================================================================

/**
 * @typedef {import('./mapping-compiler.js').CompiledMapping} CompiledMapping
 */

/**
 * @param {string} normalizedPath
 * @param {CompiledMapping[]} compiledMappings
 * @returns {string | null}
 */
export function applyForwardMappings(normalizedPath, compiledMappings) {
  for (const mapping of compiledMappings) {
    if (mapping.fromRegex.test(normalizedPath)) {
      return normalizedPath.replace(mapping.fromRegex, mapping.toTemplate);
    }
  }
  return null;
}
