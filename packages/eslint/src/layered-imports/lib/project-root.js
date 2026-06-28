import path from 'path';
import fs from 'fs';

// ============================================================================
// 프로젝트 루트 탐색
// ============================================================================

/**
 * 시작 디렉토리에서 위로 올라가며 package.json이 존재하는 가장 상위 디렉토리를 반환한다.
 * 중간에 package.json이 없는 디렉토리가 있어도 계속 탐색하며,
 * fs root까지 도달하면 마지막으로 발견된 디렉토리를 반환한다.
 *
 * @param {string} startDir
 * @returns {string | null}
 */
export function findProjectRoot(startDir) {
  let dir = path.resolve(startDir);
  const fsRoot = path.parse(dir).root;
  let lastFound = null;

  while (true) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      lastFound = dir;
    }

    if (dir === fsRoot) break;

    const parent = path.dirname(dir);
    if (parent === dir) break;

    dir = parent;
  }

  return lastFound;
}
