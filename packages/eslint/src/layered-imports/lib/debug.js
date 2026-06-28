// ============================================================================
// 디버그 유틸
// ============================================================================

export const ESLINT_DEBUG = false;
/**
 * @param {string} step
 * @param {unknown} data
 */
export function debug(step, data) {
  if (!ESLINT_DEBUG) return;
  console.log(`\n[Path-Conv: ${step}]`);
  console.dir(data, { depth: null });
}
