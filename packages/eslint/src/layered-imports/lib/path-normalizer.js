import path from 'path';

import { findMatchingAliasMapping } from './path-classifier.js';

// ============================================================================
// 정규화 경로(프로젝트 루트 기준 POSIX 경로)로 변환
// ----------------------------------------------------------------------------
// 모든 import 경로를 단일 표현으로 환산한다.
// ============================================================================

/**
 * @typedef {import('./mapping-compiler.js').CompiledMapping} CompiledMapping
 */

/**
 * @param {string} p
 * @returns {string}
 */
export function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

/**
 * @param {string} importPath
 * @param {string} currentFileDir
 * @param {string} projectRoot
 * @returns {string | null}
 */
export function normalizeRelativeImport(importPath, currentFileDir, projectRoot) {
  const absolute = path.resolve(currentFileDir, importPath);
  const relativeToRoot = path.relative(projectRoot, absolute);
  // 프로젝트 루트 바깥은 변환 불가
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }
  return toPosixPath(relativeToRoot);
}

/**
 * @param {string} importPath
 * @param {CompiledMapping[]} compiledMappings
 * @returns {string | null}
 */
export function normalizeAliasedImport(importPath, compiledMappings) {
  const mapping = findMatchingAliasMapping(importPath, compiledMappings);
  if (!mapping) return null;
  return importPath.replace(mapping.toRegex, mapping.fromTemplate);
}

/**
 * 정규화 경로(프로젝트 루트 기준)를 currentFileDir 기준 상대 경로로 역변환한다.
 *
 * @param {string} normalizedPath
 * @param {string} currentFileDir
 * @param {string} projectRoot
 * @returns {string}
 */
export function denormalizeToRelative(normalizedPath, currentFileDir, projectRoot) {
  const absoluteTarget = path.resolve(projectRoot, normalizedPath);
  const rel = path.relative(currentFileDir, absoluteTarget);
  const posix = toPosixPath(rel);
  return posix.startsWith('.') ? posix : './' + posix;
}
