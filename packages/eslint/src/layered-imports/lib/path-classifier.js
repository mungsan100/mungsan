// ============================================================================
// Path 분류
// ============================================================================

/**
 * @typedef {import('./mapping-compiler.js').CompiledMapping} CompiledMapping
 */

/**
 * @param {string} importPath
 * @returns {boolean}
 */
export function isRelativeImport(importPath) {
  return (
    importPath.startsWith('./') ||
    importPath.startsWith('../') ||
    importPath === '.' ||
    importPath === '..'
  );
}

/**
 * @param {string} importPath
 * @param {CompiledMapping[]} compiledMappings
 * @returns {CompiledMapping | null}
 */
export function findMatchingAliasMapping(importPath, compiledMappings) {
  for (const mapping of compiledMappings) {
    if (mapping.toRegex.test(importPath)) return mapping;
  }
  return null;
}

/**
 * @param {string} importPath
 * @param {CompiledMapping[]} compiledMappings
 * @returns {'relative' | 'aliased' | 'external'}
 */
export function classifyImport(importPath, compiledMappings) {
  if (isRelativeImport(importPath)) return 'relative';
  if (findMatchingAliasMapping(importPath, compiledMappings)) return 'aliased';
  for (const mapping of compiledMappings) {
    // catch-all('*')은 모든 bare 스펙시파이어(react 등 외부 import)에 매칭되어
    // raw-path 탐지로는 in-project/external을 구분할 수 없으므로 제외한다.
    // ('*'는 relative→alias 정방향, alias→정규화 역방향 변환에만 사용.)
    if (mapping.raw.from === '*') continue;
    if (mapping.fromRegex.test(importPath)) return 'normalized';
  }
  return 'external';
}
