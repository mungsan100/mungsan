// ============================================================================
// Layer 컴파일 / enclosing module 탐색
// ----------------------------------------------------------------------------
// 옵션 형태:
//   layers: [
//     // layer 0 (최상위)
//     {
//       name: 'app',
//       modules: [
//         'apps/web/app/*',
//         { pattern: 'apps/web/app/(dashboard)/*', exclude: '^(_.*|ui|)$' },
//       ],
//       allowSameLayer: false, // (기본 false)
//     },
//     { name: 'web-root', modules: ['apps/web/*'] },
//     { name: 'lib',      modules: ['apps/web/lib/*'] },
//     { name: 'config',   modules: ['apps/web/lib/config'] }, // 최하위
//   ]
//
// 모듈 패턴 문법:
//   - 'X'   (와일드카드 없음) → X 자체가 단일 모듈
//   - 'X/*' (마지막 segment '*') → X의 직접 자식 디렉터리들 각각이 모듈
//   - 객체 { pattern: 'X/*', exclude?: regex } → 와일드카드 매치 시 마지막 segment에
//     대해 exclude regex 적용. 정확 패턴('X')에는 exclude 무시.
//
// Layer 의미:
//   - 같은 layer 모듈 간 import는 기본 금지
//     (그 layer가 allowSameLayer=true면 허용)
//   - 상위 layer(작은 인덱스) → 하위 layer(큰 인덱스) 방향 import만 허용
//
// 매칭 우선순위:
//   - 충돌 시 큰 layer index가 먼저 (아래부터 스캔). 같은 layer 내에서는 선언 순서.
// ============================================================================

/**
 * @typedef {string | { pattern: string; exclude?: string }} RawModulePattern
 * @typedef {{ name: string; modules: RawModulePattern[]; allowSameLayer?: boolean }} RawLayer
 * @typedef {{ base: string; isWildcard: boolean; excludeRegex: RegExp | null; layerIndex: number }} CompiledModuleConfig
 * @typedef {{ name: string; allowSameLayer: boolean }} LayerOption
 * @typedef {{ configs: CompiledModuleConfig[]; layerOptions: LayerOption[] }} CompiledLayers
 * @typedef {{ path: string; layerIndex: number }} EnclosingModule
 */

/**
 * @param {string} p
 * @returns {string}
 */
function normalizePath(p) {
  return p.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
}

/**
 * @param {RawModulePattern} item
 * @param {number} layerIndex
 * @param {number} position
 * @returns {CompiledModuleConfig}
 */
function compileItem(item, layerIndex, position) {
  let rawPattern;
  let exclude;
  if (typeof item === 'string') {
    rawPattern = item;
  } else if (item && typeof item === 'object') {
    if (typeof item.pattern !== 'string') {
      throw new Error(
        `layers[${layerIndex}].modules[${position}]: 'pattern'은 문자열이어야 합니다.`,
      );
    }
    rawPattern = item.pattern;
    exclude = item.exclude;
  } else {
    throw new Error(
      `layers[${layerIndex}].modules[${position}]: 문자열 또는 { pattern, exclude? } 객체여야 합니다.`,
    );
  }

  const pattern = normalizePath(rawPattern);
  let base;
  let isWildcard;
  if (pattern === '*') {
    base = '';
    isWildcard = true;
  } else if (pattern.endsWith('/*')) {
    base = pattern.slice(0, -2);
    isWildcard = true;
  } else {
    base = pattern;
    isWildcard = false;
  }

  if (base.includes('*')) {
    throw new Error(
      `layers[${layerIndex}].modules[${position}]: '*'는 패턴의 마지막 segment에서만 사용할 수 있습니다. (got '${rawPattern}')`,
    );
  }

  return {
    base,
    isWildcard,
    excludeRegex: exclude !== undefined ? new RegExp(exclude) : null,
    layerIndex,
  };
}

/**
 * @param {RawLayer} layer
 * @param {number} layerIndex
 * @returns {{ modules: RawModulePattern[]; option: LayerOption }}
 */
function normalizeLayer(layer, layerIndex) {
  if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
    throw new Error(`layers[${layerIndex}]: { name, modules, allowSameLayer? } 객체여야 합니다.`);
  }
  if (typeof layer.name !== 'string' || layer.name.length === 0) {
    throw new Error(`layers[${layerIndex}]: 'name'은 비어있지 않은 문자열이어야 합니다.`);
  }
  if (!Array.isArray(layer.modules)) {
    throw new Error(`layers[${layerIndex}]: 'modules'는 배열이어야 합니다.`);
  }
  return {
    modules: layer.modules,
    option: { name: layer.name, allowSameLayer: layer.allowSameLayer === true },
  };
}

/**
 * @param {RawLayer[]} rawLayers
 * @returns {CompiledLayers} 큰 layer index 먼저 정렬된 configs + layerIndex로 인덱싱된 옵션.
 */
export function compileLayers(rawLayers) {
  if (!Array.isArray(rawLayers)) {
    throw new Error('layers는 layer 객체의 배열이어야 합니다.');
  }
  /** @type {CompiledModuleConfig[]} */
  const configs = [];
  /** @type {LayerOption[]} */
  const layerOptions = new Array(rawLayers.length);
  const seenNames = new Set();
  // 큰 layer index 먼저 스캔 — 깊은(아래) layer가 충돌 시 우선.
  for (let layerIndex = rawLayers.length - 1; layerIndex >= 0; layerIndex--) {
    const { modules, option } = normalizeLayer(rawLayers[layerIndex], layerIndex);
    if (seenNames.has(option.name)) {
      throw new Error(`layers[${layerIndex}]: layer 이름 '${option.name}'이 중복됩니다.`);
    }
    seenNames.add(option.name);
    layerOptions[layerIndex] = option;
    modules.forEach((item, i) => {
      configs.push(compileItem(item, layerIndex, i));
    });
  }
  return { configs, layerOptions };
}

/**
 * @param {string} dir
 * @param {CompiledModuleConfig} cfg
 * @returns {boolean}
 */
function matchesConfig(dir, cfg) {
  if (!cfg.isWildcard) {
    return dir === cfg.base;
  }
  if (cfg.base === '') {
    if (dir === '' || dir.includes('/')) return false;
    if (cfg.excludeRegex && cfg.excludeRegex.test(dir)) return false;
    return true;
  }
  if (!dir.startsWith(cfg.base + '/')) return false;
  const rel = dir.slice(cfg.base.length + 1);
  if (rel === '' || rel.includes('/')) return false;
  if (cfg.excludeRegex && cfg.excludeRegex.test(rel)) return false;
  return true;
}

/**
 * @param {string} normalizedDir
 * @param {CompiledModuleConfig[]} configs
 * @returns {number | null}
 */
export function getModuleLayerIndex(normalizedDir, configs) {
  for (const cfg of configs) {
    if (matchesConfig(normalizedDir, cfg)) return cfg.layerIndex;
  }
  return null;
}

/**
 * @param {string} normalizedDir
 * @param {CompiledModuleConfig[]} configs
 * @returns {boolean}
 */
export function isModuleDir(normalizedDir, configs) {
  return getModuleLayerIndex(normalizedDir, configs) !== null;
}

/**
 * 주어진 경로에 대해 가장 깊이 enclose하는 module 디렉터리와 그 layer를 반환한다.
 *
 * - `includeSelf: true` 일 때만 입력 path 자체를 module 후보로 검사한다.
 *   import target이 디렉터리(barrel)일 수 있을 때 사용.
 * - 기본은 false (source 파일은 파일이 확실).
 *
 * @param {string} normalizedPath
 * @param {CompiledModuleConfig[]} configs
 * @param {{ includeSelf?: boolean }} [opts]
 * @returns {EnclosingModule | null}
 */
export function findEnclosingModule(normalizedPath, configs, opts = {}) {
  const includeSelf = opts.includeSelf === true;
  if (includeSelf) {
    const layer = getModuleLayerIndex(normalizedPath, configs);
    if (layer !== null) return { path: normalizedPath, layerIndex: layer };
  }
  const parts = normalizedPath.split('/');
  for (let i = parts.length - 1; i >= 1; i--) {
    const candidate = parts.slice(0, i).join('/');
    const layer = getModuleLayerIndex(candidate, configs);
    if (layer !== null) return { path: candidate, layerIndex: layer };
  }
  return null;
}
